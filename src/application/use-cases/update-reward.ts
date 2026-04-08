import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import type { Reward, UpdateRewardParams } from "@/domain/entities/reward";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export abstract class UpdateRewardError extends Error {
  abstract readonly code: string;
}

export class RewardNotFoundError extends UpdateRewardError {
  readonly code = "REWARD_NOT_FOUND";

  constructor() {
    super("Reward not found");
  }
}

export async function updateRewardUseCase(
  params: UpdateRewardParams,
  data: {
    name?: string;
    description?: string;
    status?: "active" | "inactive";
    cost?: bigint;
    image?: string;
  },
): Promise<Result<Reward, UpdateRewardError>> {
  try {
    const rewardsRepo = new RewardsRepo(DB);

    const existingReward = await rewardsRepo.findRewardById(params.rewardId);

    if (!existingReward || existingReward.deletedAt) {
      return Err(new RewardNotFoundError());
    }

    const reward = await rewardsRepo.updateReward(params.rewardId, data);

    if (!reward) {
      return Err(new RewardNotFoundError());
    }

    const rewardWithDiscount = await rewardsRepo.findRewardWithDiscount(
      params.rewardId,
    );

    return Ok({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      status: reward.status,
      cost: reward.cost,
      discountId: reward.discountId,
      image: reward.image,
      createdAt: reward.createdAt,
      deletedAt: reward.deletedAt,
      discount: rewardWithDiscount?.discountsTable,
    } as Reward);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
