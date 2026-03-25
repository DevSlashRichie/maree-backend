import {
  type Reward,
  type RewardError,
  UnknownError,
} from "@/domain/entities/reward.ts";
import { Err, Ok, type Result } from "oxide.ts";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getAvailableRewardUseCase(userId: string):
  Promise<Result<Reward[], RewardError>>{
    return await DB.transaction(async (txn) => {
      try {
        const rewardsRepo = new RewardsRepo(txn);
        const rewards = await rewardsRepo.findAvailableRewardForUser(userId);
        return Ok(rewards);
      } catch (error) {
        return Err(
            new UnknownError(
              error instanceof Error ? error.message : "unknown error",)
            );
        }
      });
    }