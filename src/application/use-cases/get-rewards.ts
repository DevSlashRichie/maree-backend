import type { Reward } from "@/domain/entities/reward";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getRewardsUseCase(): Promise<Reward[]> {
  const rewardsRepo = new RewardsRepo(DB);

  const rewards = await rewardsRepo.findAllRewards();

  return rewards;
}
