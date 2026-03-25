import { z } from "@hono/zod-openapi";

export const RedeemRewardSchema = z
  .object({
    rewardId: z.string().uuid(),
    branchId: z.string().uuid(),
  })
  .openapi("RedeemReward");

export const RedemptionHistoryItemSchema = z
  .object({
    id: z.string().uuid(),
    rewardId: z.string().uuid(),
    userId: z.string().uuid(),
    branchId: z.string().uuid(),
    createdAt: z.string().datetime(),
  })
  .openapi("RedemptionHistoryItem");

export const RedeemResultSchema = z
  .object({
    newBalance: z.bigint(),
  })
  .openapi("RedeemResult");
