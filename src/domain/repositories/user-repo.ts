import type { InferInsertModel } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import { userTable } from "@/infrastructure/db/schema";

export type CreateUser = Omit<
  InferInsertModel<typeof userTable>,
  "id" | "createdAt"
>;

export class UserRepo {
  constructor(private readonly conn: Executor) {}

  async findById(id: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
    });

    return user;
  }

  async findByIdWithRole(id: string) {
    const userAndRole = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
      with: {
        rolesTable: true,
      },
    });

    return userAndRole;
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
    const userAndPassword = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
      with: {
        userPasswordTable: {
          columns: {
            password: true,
          },
        },
      },
    });

    return userAndPassword;
  }

  async saveUser(data: CreateUser) {
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
    return user;
  }
}
