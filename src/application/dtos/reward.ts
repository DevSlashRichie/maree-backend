import { z } from "@hono/zod-openapi";
import { DISCOUNT_STATES } from "@/domain/entities/discount";
import { RewardRedeemSchema } from "@/domain/entities/loyalty";

export const CreateRewardDto = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(DISCOUNT_STATES),
    cost: z.coerce.bigint(),
    image: z.string().url().optional(),
    discount: z
      .object({
        type: z.enum(["percentage", "fixed"]),
        value: z.coerce.bigint(),
        appliesTo: z.array(z.string()).min(0),
      })
      .optional(),
  })
  .openapi("CreateReward");

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

export const UpdateRewardDto = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(DISCOUNT_STATES).optional(),
    cost: z.coerce.bigint().optional(),
    image: z.string().url().optional(),
  })
  .openapi("UpdateReward");

export const LoyaltyCardDetailsDto = z.object({
  currentBalance: z.number(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  lastRedemptions: z.array(
    z.object({
      name: z.string(),
      branch: z.string(),
      date: z.string(),
    }),
  ),
});
