import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import type { DeleteRewardParams } from "@/domain/entities/reward";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export abstract class DeleteRewardError extends Error {
  abstract readonly code: string;
}

export class RewardNotFoundError extends DeleteRewardError {
  readonly code = "REWARD_NOT_FOUND";

  constructor() {
    super("Reward not found");
  }
}

export async function deleteRewardUseCase(
  params: DeleteRewardParams,
): Promise<Result<void, DeleteRewardError>> {
  try {
    const rewardsRepo = new RewardsRepo(DB);

    const existingReward = await rewardsRepo.findRewardById(params.rewardId);

    if (!existingReward || existingReward.deletedAt) {
      return Err(new RewardNotFoundError());
    }

    await rewardsRepo.softDeleteReward(params.rewardId);

    return Ok(undefined);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
