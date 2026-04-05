import { eq, sql } from "drizzle-orm";
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
    status: "active" | "inactive";
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

  async findAllRewards(status?: "active" | "inactive") {
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
      status?: "active" | "inactive";
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

  async hasUserRedeemedReward(rewardId: string, userId: string) {
    const redemption = await this.conn.query.rewardRedemptionsTable.findFirst({
      where: { rewardId, userId },
    });
    return !!redemption;
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
    userId: string,
    value: bigint,
    transactionType: "earned" | "redeemed",
    orderId?: string,
  ) {
    const result = await this.conn
      .insert(loyaltyTransactionsTable)
      .values({
        userId,
        value,
        transactionType,
        orderId,
      })
      .returning();
    return result[0];
  }

  async calculateLoyaltyBalance(userId: string): Promise<bigint> {
    const balanceQuery = await this.conn
      .select({
        totalVisits: sql<string>`
          SUM(
            CASE 
              WHEN ${loyaltyTransactionsTable.transactionType} = 'earned' THEN ${loyaltyTransactionsTable.value}
              WHEN ${loyaltyTransactionsTable.transactionType} = 'redeemed' THEN -${loyaltyTransactionsTable.value}
              ELSE 0
            END
          )
        `,
      })
      .from(loyaltyTransactionsTable)
      .where(eq(loyaltyTransactionsTable.userId, userId))
      .groupBy(loyaltyTransactionsTable.userId);

    return BigInt(balanceQuery[0]?.totalVisits ?? "0");
  }
}
