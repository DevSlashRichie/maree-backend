import type { InferInsertModel } from "drizzle-orm";
import { and, eq, sql, or } from "drizzle-orm";
import type z from "zod";
import type { Pagination, StaffFilters, UserFilters } from "@/application/dtos";
import type { UserListSchema } from "@/application/dtos/user";
import type { User } from "@/domain/entities/user";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  loyaltyTransactionsTable,
  ordersTable,
  rolesTable,
  staffTable,
  userPasswordTable,
  userRoleTable,
  userTable,
} from "@/infrastructure/db/schema";
import { buildFilters } from "@/lib/filters";
import { isUuid } from "@/lib/uuid";

type SaveUserType = Omit<
  InferInsertModel<typeof userTable>,
  "id" | "createdAt"
>;

type SavePasswordType = Omit<
  InferInsertModel<typeof userPasswordTable>,
  "createdAt"
>;

export interface UserWithStats extends User {
  totalConsumed: number | null;
  totalVisits: number | null;
}

export interface PaginatedUsers {
  users: UserWithStats[];
  total: number;
  page: number;
  limit: number;
}

export class UserRepo {
  constructor(private readonly conn: Executor) { }

  async findAll(
    filters?: UserFilters,
    pagination?: Pagination,
  ): Promise<z.infer<typeof UserListSchema>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, userTable)
      : [];

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const ordersSubquery = this.conn
      .select({
        userId: ordersTable.userId,
        totalConsumed: sql<bigint>`SUM(${ordersTable.total})`.as(
          "totalConsumed",
        ),
      })
      .from(ordersTable)
      .groupBy(ordersTable.userId)
      .as("ordersSubquery");

    const loyaltySubquery = this.conn
      .select({
        userId: loyaltyTransactionsTable.userId,
        totalVisits: sql<bigint>`
      SUM(
        CASE 
          WHEN ${loyaltyTransactionsTable.transactionType} = 'earned' THEN ${loyaltyTransactionsTable.value}
          WHEN ${loyaltyTransactionsTable.transactionType} = 'redeemed' THEN -${loyaltyTransactionsTable.value}
          ELSE 0
        END
      )
    `.as("totalVisits"),
      })
      .from(loyaltyTransactionsTable)
      .groupBy(loyaltyTransactionsTable.userId)
      .as("loyaltySubquery");

    const users = this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        totalConsumed: sql<
          string | null
        >`COALESCE(${ordersSubquery.totalConsumed}, 0)`,
        totalVisits: sql<
          string | null
        >`COALESCE(${loyaltySubquery.totalVisits}, 0)`,
      })
      .from(userTable)
      .leftJoin(ordersSubquery, eq(ordersSubquery.userId, userTable.id))
      .leftJoin(loyaltySubquery, eq(loyaltySubquery.userId, userTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const countResult = await this.conn
      .select({ count: sql<number>`count(*)` })
      .from(userTable)
      .where(whereClause);

    const total = Number(countResult[0]?.count ?? 0);

    return {
      users: (await users).map((u) => ({
        ...u,
        totalConsumed: Number(u.totalConsumed),
        totalVisits: Number(u.totalVisits),
      })),
      total,
      page,
      limit,
    };
  }

  async findAllStaff(_filters?: StaffFilters, pagination?: Pagination) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const users = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        role: rolesTable.name,
      })
      .from(userTable)
      .innerJoin(userRoleTable, eq(userRoleTable.userId, userTable.id))
      .innerJoin(rolesTable, eq(rolesTable.id, userRoleTable.roleId))
      .limit(limit)
      .offset(offset);

    const countResult = await this.conn
      .select({ count: sql<number>`count(*)` })
      .from(userTable)
      .innerJoin(userRoleTable, eq(userRoleTable.userId, userTable.id));

    const total = Number(countResult[0]?.count ?? 0);
    return { users, total, page, limit };
  }

  async findStaffByBranch(branchId: string) {
    const users = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        role: rolesTable.name,
      })
      .from(userTable)
      .innerJoin(userRoleTable, eq(userRoleTable.userId, userTable.id))
      .innerJoin(rolesTable, eq(rolesTable.id, userRoleTable.roleId))
      .innerJoin(staffTable, eq(staffTable.userId, userTable.id))
      .where(eq(staffTable.branchId, branchId));

    return { users };
  }

  async findById(id: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
    });

    return user;
  }

  async findOneByIdWithStats(id: string): Promise<UserWithStats | null> {
    const ordersSubquery = this.conn
      .select({
        userId: ordersTable.userId,
        totalConsumed: sql<bigint>`SUM(${ordersTable.total})`.as(
          "totalConsumed",
        ),
      })
      .from(ordersTable)
      .groupBy(ordersTable.userId)
      .as("ordersSubquery");

    const loyaltySubquery = this.conn
      .select({
        userId: loyaltyTransactionsTable.userId,
        totalVisits: sql<bigint>`
      SUM(
        CASE 
          WHEN ${loyaltyTransactionsTable.transactionType} = 'earned' THEN ${loyaltyTransactionsTable.value}
          WHEN ${loyaltyTransactionsTable.transactionType} = 'redeemed' THEN -${loyaltyTransactionsTable.value}
          ELSE 0
        END
      )
    `.as("totalVisits"),
      })
      .from(loyaltyTransactionsTable)
      .groupBy(loyaltyTransactionsTable.userId)
      .as("loyaltySubquery");

    const [user] = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        totalConsumed: sql<
          string | null
        >`COALESCE(${ordersSubquery.totalConsumed}, 0)`,
        totalVisits: sql<
          string | null
        >`COALESCE(${loyaltySubquery.totalVisits}, 0)`,
      })
      .from(userTable)
      .leftJoin(ordersSubquery, eq(ordersSubquery.userId, userTable.id))
      .leftJoin(loyaltySubquery, eq(loyaltySubquery.userId, userTable.id))
      .where(isUuid(id) ? eq(userTable.id, id) : eq(userTable.phone, id))
      .limit(1);

    if (!user) return null;

    return {
      ...user,
      totalConsumed: Number(user.totalConsumed),
      totalVisits: Number(user.totalVisits),
    };
  }

  async findByIdWithRole(id: string) {
    const userAndRole = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        roleId: userRoleTable.roleId,
        roleName: rolesTable.name,
      })
      .from(userTable)
      .leftJoin(userRoleTable, eq(userRoleTable.userId, userTable.id))
      .leftJoin(rolesTable, eq(rolesTable.id, userRoleTable.roleId))
      .where(eq(userTable.id, id))
      .limit(1);

    return userAndRole[0] || null;
  }

  async findStaffById(id: string) {
    const staffMember = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        roleId: userRoleTable.roleId,
        roleName: rolesTable.name,
      })
      .from(userTable)
      .leftJoin(userRoleTable, eq(userRoleTable.userId, userTable.id))
      .leftJoin(rolesTable, eq(rolesTable.id, userRoleTable.roleId))
      .where(eq(userTable.id, id))
      .limit(1);

    if (!staffMember[0]) {
      return null;
    }

    const staff = await this.conn.query.staffTable.findFirst({
      where: {
        userId: id,
      },
    });

    return {
      ...staffMember[0],
      branchId: staff?.branchId ?? null,
    };
  }

  async findByIdentity(identity: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        OR: [
          {
            email: identity,
          },
          {
            phone: identity,
          },
        ],
      },
    });

    return user;
  }

  async findByIdWithPassword(id: string) {
    const userAndPassword = await this.conn
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        phone: userTable.phone,
        email: userTable.email,
        createdAt: userTable.createdAt,
        password: userPasswordTable.password,
      })
      .from(userTable)
      .leftJoin(userPasswordTable, eq(userPasswordTable.userId, userTable.id))
      .where(eq(userTable.id, id))
      .limit(1);

    return userAndPassword[0] || null;
  }

  async existsUser(phone: string, email?: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            phone,
          },
        ],
      },
    });

    return !!user;
  }

  async saveUser(data: SaveUserType) {
    const [user] = await this.conn
      .insert(userTable)
      .values(data)
      .onConflictDoUpdate({
        target: userTable.email,
        set: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      })
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new user, it should always exist
    return user!;
  }

  async savePassword(data: SavePasswordType) {
    const [userPassword] = await this.conn
      .insert(userPasswordTable)
      .values(data)
      .returning();
    return userPassword;
  }

  async saveStaff(data: { userId: string; branchId: string; role: string }) {
    await this.conn.insert(staffTable).values(data).onConflictDoNothing();
  }

  async deleteStaff(userId: string) {
    await this.conn.delete(staffTable).where(eq(staffTable.userId, userId));
  }
}
