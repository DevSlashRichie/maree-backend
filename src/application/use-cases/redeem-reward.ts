import {
  InsufficientPointsError,
  LoyaltyCardNotFoundError,
  RewardNotFoundError,
} from "@/application/errors/redeem-reward";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export type RedeemRewardInput = {
  userId: string;
  rewardId: string;
  branchId: string;
};

export async function redeemRewardUseCase(input: RedeemRewardInput) {
  const rewardsRepo = new RewardsRepo(DB);

  const reward = await rewardsRepo.findRewardById(input.rewardId);
  if (!reward) {
    throw new RewardNotFoundError();
  }

  const loyaltyCard = await rewardsRepo.findLoyaltyCardByUserId(input.userId);
  if (!loyaltyCard) {
    throw new LoyaltyCardNotFoundError();
  }

  if (loyaltyCard.currentBalance < reward.cost) {
    throw new InsufficientPointsError(reward.cost, loyaltyCard.currentBalance);
  }

  const newBalance = loyaltyCard.currentBalance - reward.cost;

  await DB.transaction(async (tx) => {
    const txRepo = new RewardsRepo(tx);

    await txRepo.createRedemption(input.rewardId, input.userId, input.branchId);
    await txRepo.createLoyaltyTransaction(
      loyaltyCard.id,
      reward.cost,
      "redeemed",
    );
    await txRepo.updateLoyaltyBalance(loyaltyCard.id, newBalance);
  });

  return { newBalance };
}
