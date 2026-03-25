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
