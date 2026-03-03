import type { Executor } from "@/infrastructure/db/postgres";

export class UserRepo {
    constructor(private readonly conn: Executor) { }

    findById(id: string) {
        this.conn.query.userTable.findFirst({
            where: (table, { eq }) => eq(table.id, ""),
        });
    }
}
