import { Option } from "oxide.ts";
import type { Executor } from "@/infrastructure/db/postgres";

export class UserRepo {
  constructor(private readonly conn: Executor) { }

  async findById(id: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        id,
      }
    });

    return Option.from(user);
  }

  async findByIdWithRole(id: string) {
    const userAndRole = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
      with: {
        rolesTable: true,
      }
    });

    return Option.from(userAndRole);
  }

  async findByIdentity(identity: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: {
        OR: [{
          email: identity,
        }, {
          phone: identity
        }]
      }

    });

    return Option.from(user);
  }

  async findByIdWithPassword(id: string) {
    const userAndPassword = await this.conn.query.userTable.findFirst({
      where: {
        id,
      },
      with: {
        userPasswordTable: {
          columns: {
            password: true
          }
        }
      },
    });

    return Option.from(userAndPassword);
  }
}
