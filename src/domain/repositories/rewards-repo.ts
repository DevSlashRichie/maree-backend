import { eq } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  loyaltyTransactionsTable,
  rewardRedemptionsTable,
  rewardsTable,
} from "@/infrastructure/db/schema";

export class RewardsRepo {
  constructor(private readonly conn: Executor) {}

  async saveReward(data: {
    name: string;
    description: string;
    status: string;
    cost: bigint;
    discountId: string;
    image?: string;
  }) {
    const result = await this.conn
      .insert(rewardsTable)
      .values({
        name: data.name,
        description: data.description,
        status: data.status,
        cost: data.cost,
        discountId: data.discountId,
        image: data.image,
      })
      .returning();
    return result[0];
  }

  async findAllRewards(status?: "enabled" | "disabled") {
    const rewards = await this.conn.query.rewardsTable.findMany({
      where: status ? { status } : undefined,
      with: {
        discountsTable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return rewards.filter((r) => !r.deletedAt);
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

  // async findLoyaltyCardByUserId(userId: string) {
  //   const card = await this.conn.query.loyaltyCardsTable.findFirst({
  //     where: {
  //       userId,
  //     },
  //   });
  //   return card;
  // }

  async findRewardById(rewardId: string) {
    const reward = await this.conn.query.rewardsTable.findFirst({
      where: { id: rewardId },
    });
    return reward;
  }

  async softDeleteReward(rewardId: string) {
    const [reward] = await this.conn
      .update(rewardsTable)
      .set({ deletedAt: new Date() })
      .where(eq(rewardsTable.id, rewardId))
      .returning();
    return reward;
  }

  async updateReward(
    rewardId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      cost?: bigint;
      image?: string;
    },
  ) {
    const [reward] = await this.conn
      .update(rewardsTable)
      .set(data)
      .where(eq(rewardsTable.id, rewardId))
      .returning();
    return reward;
  }

  async findRewardWithDiscount(rewardId: string) {
    const reward = await this.conn.query.rewardsTable.findFirst({
      where: { id: rewardId },
      with: {
        discountsTable: true,
      },
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
}
