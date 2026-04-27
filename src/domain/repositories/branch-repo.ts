import { eq, type InferInsertModel } from "drizzle-orm";
import { CreateBranchError } from "@/application/errors/create-branch";
import type { Executor } from "@/infrastructure/db/postgres";
import { branchsTable, schedulesTable } from "@/infrastructure/db/schema";

type SaveBranchType = Omit<
  InferInsertModel<typeof branchsTable>,
  "id" | "createdAt"
>;

type SaveScheduleType = Omit<
  InferInsertModel<typeof schedulesTable>,
  "id" | "createdAt" | "branchId"
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

  async findAllOpen() {
    return this.conn.query.branchsTable.findMany({
      where: { state: "active" },
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

    const [branch] = await this.conn
      .insert(branchsTable)
      .values(branchData)
      .returning();

    if (!branch) {
      throw CreateBranchError;
    }

    if (schedules.length > 0) {
      const schedulesWithBranch = schedules.map((s) => ({
        ...s,
        branchId: branch.id,
      }));
      await this.conn.insert(schedulesTable).values(schedulesWithBranch);
    }

    return branch;
  }

  async updateBranch(
    id: string,
    data: {
      name?: string;
      state?: "active" | "inactive";
      schedules?: {
        weekday: number;
        fromTime: string;
        toTime: string;
        timezone: string;
      }[];
    },
  ) {
    if (data.name !== undefined || data.state !== undefined) {
      await this.conn
        .update(branchsTable)
        .set({
          ...(data.name ? { name: data.name } : {}),
          ...(data.state ? { state: data.state } : {}),
        })
        .where(eq(branchsTable.id, id));
    }

    if (data.schedules !== undefined) {
      await this.conn
        .delete(schedulesTable)
        .where(eq(schedulesTable.branchId, id));

      if (data.schedules.length > 0) {
        await this.conn
          .insert(schedulesTable)
          .values(data.schedules.map((s) => ({ ...s, branchId: id })));
      }
    }

    return this.conn.query.branchsTable.findFirst({
      where: { id },
      with: { schedulesTable: true },
    });
  }

  async deleteBranch(id: string) {
    const { staffTable } = await import("@/infrastructure/db/schema");
    await this.conn.delete(staffTable).where(eq(staffTable.branchId, id));
    await this.conn
      .delete(schedulesTable)
      .where(eq(schedulesTable.branchId, id));
    await this.conn.delete(branchsTable).where(eq(branchsTable.id, id));
  }
}
