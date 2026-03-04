import { Option } from "oxide.ts";
import type { Executor } from "@/infrastructure/db/postgres";

export class UserRepo {
  constructor(private readonly conn: Executor) { }

  async findById(id: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    return Option.from(user);
  }

  async findByIdWithRole(id: string) {
    const userAndRole = await this.conn.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        roles: true,
      },
    });

    return Option.from(userAndRole);
  }

  async findByIdentity(identity: string) {
    const user = await this.conn.query.userTable.findFirst({
      where: (table, { eq, or }) => or(
        eq(table.email, identity),
        eq(table.phone, identity),
      )
    });

    return Option.from(user);
  }

  async findByIdWithPassword(id: string) {
    const userAndPassword = await this.conn.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        passwords: true,
      },
    });

    return Option.from(userAndPassword);
  }
}
