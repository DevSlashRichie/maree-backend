import type { Executor } from "@/infrastructure/db/postgres";
import {
  loyaltyCardsTable,
  loyaltyTransactionsTable,
  rewardRedemptionsTable,
  rewardsTable,
} from "@/infrastructure/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import type { Reward } from "@/domain/entities/reward";

export class RewardsRepo {
  constructor(private readonly conn: Executor) {}

  async findAllRewards(status?: "enabled" | "disabled") {
    const rewards = await this.conn.query.rewardsTable.findMany({
      where: {
        status,
      },
    });

    return rewards;
  }

  async findReedemsForUser(userId: string) {
    const reedemptions = await this.conn.query.rewardRedemptionsTable.findMany({
      where: {
        userId,
      },
      with: {
        rewardsTable: true,
      },
    });

    return reedemptions;
  }

  async findLoyaltyCardByUserId(userId: string) {
    const card = await this.conn.query.loyaltyCardsTable.findFirst({
      where: {
        userId,
      },
    });
    return card;
  }

  async findRewardById(rewardId: string) {
    const reward = await this.conn.query.rewardsTable.findFirst({
      where: { id: rewardId },
    });
    return reward;
  }

  async createRedemption(rewardId: string, userId: string, branchId: string) {
    const result = await this.conn
      .insert(rewardRedemptionsTable)
      .values({
        rewardId,
        userId,
        branchId,
      })
      .returning();
    return result[0];
  }

  async createLoyaltyTransaction(
    loyaltyCardId: string,
    value: bigint,
    transactionType: "earned" | "redeemed",
    orderId?: string,
  ) {
    const result = await this.conn
      .insert(loyaltyTransactionsTable)
      .values({
        loyaltyCardId,
        value,
        transactionType,
        orderId,
      })
      .returning();
    return result[0];
  }

  async updateLoyaltyBalance(loyaltyCardId: string, newBalance: bigint) {
    await this.conn
      .update(loyaltyCardsTable)
      .set({ currentBalance: newBalance })
      // @ts-expect-error - drizzle beta version typing issue
      .where({ id: loyaltyCardId })
      .execute();
  }

    async findAvailableRewardForUser(userId: string): Promise<Reward[]> {
    const redeemed = await this.conn
      .select({ rewardId: rewardRedemptionsTable.rewardId })
      .from(rewardRedemptionsTable)
      .where(eq(rewardRedemptionsTable.userId, userId));

    const redeemedIds = redeemed.map((r) => r.rewardId);

    return this.conn
      .select()
      .from(rewardsTable)
      .where(
        and(
          eq(rewardsTable.status, "active"),
          redeemedIds.length > 0
            ? notInArray(rewardsTable.id, redeemedIds)
            : undefined
        )
      );
  }
}


