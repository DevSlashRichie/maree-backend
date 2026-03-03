import type { Executor } from "@/infrastructure/db/postgres";
import { Option } from "oxide.ts";

export class UserRepo {
    constructor(private readonly conn: Executor) { }

    async findById(id: string) {
        const user = await this.conn.query.userTable.findFirst({
            where: (table, { eq }) => eq(table.id, id),
        });

        return Option.from(user);
    }
}
