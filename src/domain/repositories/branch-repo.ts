import type { InferInsertModel } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import { branchsTable } from "@/infrastructure/db/schema";

type SaveBranchType = Omit<
  InferInsertModel<typeof branchsTable>,
  "id" | "createdAt"
>;

export class BranchRepo {
  constructor(private readonly conn: Executor) {}

  async existsBranch(name: string) {
    const branch = await this.conn.query.branchsTable.findFirst({
      where: {
        name,
      },
    });

    return !!branch;
  }

  async findByName(name: string) {
    const branch = await this.conn.query.branchsTable.findFirst({
      where: {
        name,
      },
    });

    return branch;
  }

  async saveBranch(data: SaveBranchType) {
    const [branch] = await this.conn
      .insert(branchsTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new user, it should always exist
    return branch!;
  }
}
