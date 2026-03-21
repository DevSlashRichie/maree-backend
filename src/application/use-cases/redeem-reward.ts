import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export class InsufficientPointsError extends Error {
  code = "insufficient_points";
  required: bigint;
  available: bigint;

  constructor(required: bigint, available: bigint) {
    super("Insufficient points to redeem this reward");
    this.required = required;
    this.available = available;
  }
}

export class RewardNotFoundError extends Error {
  code = "reward_not_found";

  constructor() {
    super("Reward not found");
  }
}

export class LoyaltyCardNotFoundError extends Error {
  code = "loyalty_card_not_found";

  constructor() {
    super("Loyalty card not found");
  }
}

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
