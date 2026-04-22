import { desc, eq, notInArray, and, isNull } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  branchsTable,
  loyaltyTransactionsTable,
  rewardRedemptionsTable,
  rewardsTable,
} from "@/infrastructure/db/schema";

export class LoyaltyRepo {
  constructor(private readonly conn: Executor) {}

  async findCurrentBalance(userId: string) {
    const transactions = await this.conn
      .select({
        transactionType: loyaltyTransactionsTable.transactionType,
        value: loyaltyTransactionsTable.value,
      })
      .from(loyaltyTransactionsTable)
      .where(eq(loyaltyTransactionsTable.userId, userId));

    const earned = transactions
      .filter((t) => t.transactionType === "earned")
      .reduce((acc: number, t) => acc + Number(t.value), 0);

    const redeemed = transactions
      .filter((t) => t.transactionType === "redeemed")
      .reduce((acc: number, t) => acc + Number(t.value), 0);

    return earned - redeemed;
  }

  async findLastRedemptions(userId: string, limit: number) {
    return await this.conn
      .select()
      .from(rewardRedemptionsTable)
      .innerJoin(
        branchsTable,
        eq(rewardRedemptionsTable.branchId, branchsTable.id),
      )
      .innerJoin(
        rewardsTable,
        eq(rewardRedemptionsTable.rewardId, rewardsTable.id),
      )
      .where(eq(rewardRedemptionsTable.userId, userId))
      .orderBy(desc(rewardRedemptionsTable.createdAt))
      .limit(limit);
  }

  async findAvailableRewards(userId: string) {
    const redeemedRewardsIds =  this.conn
    .select({ rewardId: rewardRedemptionsTable.rewardId})
    .from (rewardRedemptionsTable)
    .where(eq(rewardRedemptionsTable.userId, userId));

    return await this.conn
    .select()
    .from(rewardsTable)
    .where(
      and(
        notInArray(rewardsTable.id, redeemedRewardsIds),
        isNull(rewardsTable.deletedAt)
      ),
    );
  }
}
