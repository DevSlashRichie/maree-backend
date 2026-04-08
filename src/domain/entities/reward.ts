import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import {
  createRewardCost,
  InvalidRewardCostError,
} from "@/domain/value-objects/reward-cost";
import { rewardsTable } from "@/infrastructure/db/schema";
import { DiscountSchema } from "./discount";

export const RewardSchema = createSelectSchema(rewardsTable)
  .extend({
    status: z.enum(["active", "inactive"]),
    discount: DiscountSchema,
  })
  .openapi("RewardSchema");

export const DeleteRewardParamsSchema = z.object({
  rewardId: z.string().uuid(),
});

export type DeleteRewardParams = z.infer<typeof DeleteRewardParamsSchema>;

export const UpdateRewardParamsSchema = z.object({
  rewardId: z.string().uuid(),
});

export type UpdateRewardParams = z.infer<typeof UpdateRewardParamsSchema>;

export interface UpdateRewardData {
  name?: string;
  description?: string;
  status?: "active" | "inactive";
  cost?: bigint;
  image?: string;
}

export type Reward = z.infer<typeof RewardSchema>;

export abstract class RewardDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateRewardParams {
  name: string;
  description: string;
  status: "active" | "inactive";
  cost: bigint;
  discountId: string;
  image?: string;
}

export function createReward(params: CreateRewardParams) {
  const parsedName = z.string().min(1).parse(params.name);
  const parsedDescription = z.string().min(1).parse(params.description);
  const parsedStatus = z.enum(["active", "inactive"]).parse(params.status);
  const parsedCost = createRewardCost(params.cost);
  const parsedDiscountId = z.string().uuid().parse(params.discountId);
  const parsedImage = params.image
    ? z.string().url().parse(params.image)
    : undefined;

  return {
    name: parsedName,
    description: parsedDescription,
    status: parsedStatus,
    cost: parsedCost,
    discountId: parsedDiscountId,
    image: parsedImage,
  };
}

export { InvalidRewardCostError };
