import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  createRewardCost,
  InvalidRewardCostError,
} from "@/domain/value-objects/reward-cost";
import { rewardsTable } from "@/infrastructure/db/schema";

export type Reward = InferSelectModel<typeof rewardsTable>;

export const RewardSchema = createSelectSchema(rewardsTable);
export type RewardType = z.infer<typeof RewardSchema>;

export abstract class RewardDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateRewardParams {
  name: string;
  description: string;
  status: string;
  cost: bigint;
  image?: string;
}

export function createReward(params: CreateRewardParams) {
  const parsedName = z.string().min(1).parse(params.name);
  const parsedDescription = z.string().min(1).parse(params.description);
  const parsedStatus = z.string().min(1).parse(params.status);
  const parsedCost = createRewardCost(params.cost);
  const parsedImage = params.image
    ? z.string().url().parse(params.image)
    : undefined;

  return {
    name: parsedName,
    description: parsedDescription,
    status: parsedStatus,
    cost: parsedCost,
    image: parsedImage,
  };
}

export { InvalidRewardCostError };
