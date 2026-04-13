import { eq } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import { discountBranchesTable, discountsTable } from "@/infrastructure/db/schema";

export class DiscountRepo {
  constructor(private readonly conn: Executor) {}

  async saveDiscount(data: {
    name: string;
    type: string;
    value: bigint;
    appliesTo: string[];
    state: "active" | "inactive";
    startDate: Date;
    endDate: Date;
    code?: string;
    maxUses?: number;
    hidden?: boolean;
  }) {
    const result = await this.conn
      .insert(discountsTable)
      .values({
        name: data.name,
        type: data.type,
        value: data.value,
        appliesTo: data.appliesTo,
        state: data.state,
        startDate: data.startDate,
        endDate: data.endDate,
        code: data.code,
        maxUses: data.maxUses,
        hidden: data.hidden,
      })
      .returning();
    return result[0];
  }

  async findDiscountById(id: string) {
    const discount = await this.conn.query.discountsTable.findFirst({
      where: { id },
    });
    return discount;
  }

  async findByBranch(branchId: string) {
    const result = await this.conn
      .select()
      .from(discountsTable)
      .innerJoin(discountBranchesTable, eq(discountBranchesTable.discountId, discountsTable.id))
      .where(eq(discountBranchesTable.branchId, branchId));

    return result.map((r) => r.discount);
  }

  async saveBranchDiscount(data: { discountId: string; branchId: string }) {
    await this.conn
      .insert(discountBranchesTable)
      .values(data)
      .onConflictDoNothing();
  }
}