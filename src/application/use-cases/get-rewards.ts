import type { Reward } from "@/domain/entities/reward";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getRewardsUseCase(): Promise<Reward[]> {
  const rewardsRepo = new RewardsRepo(DB);

  const rewards = (await rewardsRepo.findAllRewards()).map(
    (it) =>
      ({
        id: it.id,
        name: it.name,
        description: it.description,
        status: it.status,
        cost: it.cost,
        createdAt: it.createdAt,
        deletedAt: it.deletedAt,
        discountId: it.discountId,
        image: it.image,
        discount: it.discountsTable,
      }) as Reward,
  );

  return rewards;
}
