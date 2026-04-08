import type { InferInsertModel } from "drizzle-orm";
import { CreateBranchError } from "@/application/errors/create-branch";
import type { Executor } from "@/infrastructure/db/postgres";
import { branchsTable, schedulesTable } from "@/infrastructure/db/schema";

type SaveBranchType = Omit<
  InferInsertModel<typeof branchsTable>,
  "id" | "createdAt"
>;

type SaveScheduleType = Omit<
  InferInsertModel<typeof schedulesTable>,
  "id" | "createdAt"
>;

export class BranchRepo {
  constructor(private readonly conn: Executor) {}

  async existsBranch(name: string) {
    const branch = await this.conn.query.branchsTable.findFirst({
      where: { name },
    });

    return !!branch;
  }

  async findAll() {
    return this.conn.query.branchsTable.findMany({
      with: { schedulesTable: true },
    });
  }

  async findByName(name: string) {
    return this.conn.query.branchsTable.findFirst({
      where: { name },
      with: { schedulesTable: true },
    });
  }

  async findById(id: string) {
    return this.conn.query.branchsTable.findFirst({
      where: { id },
      with: { schedulesTable: true },
    });
  }

  async saveBranch(data: SaveBranchType & { schedules?: SaveScheduleType[] }) {
    const { schedules = [], ...branchData } = data;

    // 1. Crear branch
    const [branch] = await this.conn
      .insert(branchsTable)
      .values(branchData)
      .returning();

    if (!branch) {
      throw CreateBranchError;
    }

    // 2. Crear schedules si existen
    if (schedules.length > 0) {
      const schedulesWithBranch = schedules.map((s) => ({
        ...s,
        branchId: branch.id, // 🔥 clave
      }));

      await this.conn.insert(schedulesTable).values(schedulesWithBranch);
    }

    return branch;
  }
}
