import type { InferInsertModel } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";

import { userPasswordTable, userTable } from "@/infrastructure/db/schema";

type SaveUserType = Omit<
  InferInsertModel<typeof userTable>,
  "id" | "createdAt"
>;

type SavePasswordType = Omit<
  InferInsertModel<typeof userPasswordTable>,
  "created_at"
>;

export class UserRepo {
  constructor(private readonly conn: Executor) { }

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
}
