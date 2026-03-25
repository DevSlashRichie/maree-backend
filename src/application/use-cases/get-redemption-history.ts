import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getRedemptionHistoryUseCase(userId: string) {
  const rewardsRepo = new RewardsRepo(DB);

  const redemptions = await rewardsRepo.findReedemsForUser(userId);

  return redemptions;
}
