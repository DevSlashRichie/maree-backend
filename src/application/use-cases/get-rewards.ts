import {
  type Reward,
  type RewardError,
  UnknownError,
} from "@/domain/entities/reward.ts";
import { Err, Ok, type Result } from "oxide.ts";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";
import { AvailableRewardDto } from "../dtos/reward";
import { z } from "zod";

export async function getRewardsUseCase(): Promise<Reward[]> {
  const rewardsRepo = new RewardsRepo(DB);

  const rewards = await rewardsRepo.findAllRewards();

  return rewards;
}


export async function getAvailableRewardUseCase(data: z.infer<typeof AvailableRewardDto>):
  Promise<Result<Reward[], RewardError>>{
    return await DB.transaction(async (txn) => {
      try {
        const rewardsRepo = new RewardsRepo(txn);
        const rewards = await rewardsRepo.findAvailableRewardForUser(data.userId);
        return Ok(rewards);
      } catch (error) {
        return Err(
            new UnknownError(
              error instanceof Error ? error.message : "unknown error",)
            );
        }
      });
    }
