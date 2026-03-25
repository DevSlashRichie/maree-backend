import { eq } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import { loyaltyCardsTable } from "@/infrastructure/db/schema";

export class LoyaltyRepo {
  constructor(private readonly conn: Executor) {}

  async findLoyaltyCardByUserId(userId: string) {
    const [card] = await this.conn
      .select()
      .from(loyaltyCardsTable)
      .where(eq(loyaltyCardsTable.userId, userId))
      .limit(1);

    return card ?? null;
  }
}
