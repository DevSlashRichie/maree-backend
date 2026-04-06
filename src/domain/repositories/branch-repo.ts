import type { InferInsertModel } from "drizzle-orm";
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
 
  async saveBranch(data: SaveBranchType) {
    const [branch] = await this.conn
      .insert(branchsTable)
      .values(data)
      .returning();
 
    return branch!;
  }
 
  async saveSchedules(schedules: SaveScheduleType[]) {
    if (schedules.length === 0) return [];
 
    return this.conn.insert(schedulesTable).values(schedules).returning();
  }
}