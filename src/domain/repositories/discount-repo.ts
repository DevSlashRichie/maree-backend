import type { Executor } from "@/infrastructure/db/postgres";
import { discountsTable } from "@/infrastructure/db/schema";

export class DiscountRepo {
  constructor(private readonly conn: Executor) {}

  async saveDiscount(data: {
    name: string;
    type: string;
    value: bigint;
    appliesTo: string[];
    state: string;
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
}
