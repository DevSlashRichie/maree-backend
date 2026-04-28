import { eq, type InferInsertModel, inArray } from "drizzle-orm";
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

  async findAll(state?: "active" | "inactive") {
    const whereCondition = state ? { state } : undefined;
    return this.conn.query.branchsTable.findMany({
      where: whereCondition,
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
    const {
      staffTable,
      reviewsTable,
      schedulesTable,
      ordersTable,
      orderItemsTable,
      orderItemsModifiersTable,
      discountBranchesTable,
      rewardRedemptionsTable,
    } = await import("@/infrastructure/db/schema");

    // Delete related records that don't have dependent children first
    await this.conn.delete(staffTable).where(eq(staffTable.branchId, id));
    await this.conn.delete(reviewsTable).where(eq(reviewsTable.branchId, id));
    await this.conn
      .delete(discountBranchesTable)
      .where(eq(discountBranchesTable.branchId, id));
    await this.conn
      .delete(rewardRedemptionsTable)
      .where(eq(rewardRedemptionsTable.branchId, id));

    // Handle orders and their items
    const ordersToDelete = await this.conn
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.branchId, id));

    if (ordersToDelete.length > 0) {
      const orderIds = ordersToDelete.map((o) => o.id);

      // Get order items
      const itemsToDelete = await this.conn
        .select()
        .from(orderItemsTable)
        .where(inArray(orderItemsTable.orderId, orderIds));

      const itemIds = itemsToDelete.map((i) => i.id);

      if (itemIds.length > 0) {
        // Delete order item modifiers first
        await this.conn
          .delete(orderItemsModifiersTable)
          .where(inArray(orderItemsModifiersTable.orderItemId, itemIds));

        // Delete order items
        await this.conn
          .delete(orderItemsTable)
          .where(inArray(orderItemsTable.id, itemIds));
      }

      // Delete orders
      await this.conn
        .delete(ordersTable)
        .where(inArray(ordersTable.id, orderIds));
    }

    // Delete schedules
    await this.conn
      .delete(schedulesTable)
      .where(eq(schedulesTable.branchId, id));

    // Finally delete the branch
    await this.conn.delete(branchsTable).where(eq(branchsTable.id, id));
  }
}
