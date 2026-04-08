import {
  InsufficientPointsError,
  RewardAlreadyRedeemedError,
  RewardNotFoundError,
} from "@/application/errors/redeem-reward";
import { UserNotFoundError } from "@/application/use-cases/add-visit";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { z } from "zod";
import type { ReedemRewardDto } from "../dtos/reward";

export type RedeemRewardInput = {
  userId: string;
  rewardId: string;
  branchId: string;
};

export async function redeemRewardUseCase(
  input: RedeemRewardInput,
): Promise<z.infer<typeof ReedemRewardDto>> {
  return await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    const rewardsRepo = new RewardsRepo(txn);

    // Verify user exists
    const user = await userRepo.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Fetch the reward
    const reward = await rewardsRepo.findRewardById(input.rewardId);
    if (!reward || reward.status !== "active" || reward.deletedAt !== null) {
      throw new RewardNotFoundError();
    }

    // Verify user hasn't already redeemed this reward
    const hasRedeemed = await rewardsRepo.hasUserRedeemedReward(
      input.rewardId,
      input.userId,
    );

    if (hasRedeemed) {
      throw new RewardAlreadyRedeemedError();
    }

    // Verify the user has sufficient points
    const balance = await rewardsRepo.calculateLoyaltyBalance(input.userId);
    if (balance < reward.cost) {
      throw new InsufficientPointsError(reward.cost, balance);
    }

    // Create the redemption record
    const redemption = await rewardsRepo.createRedemption(
      input.rewardId,
      input.userId,
      input.branchId,
    );

    return { newBalance: balance, redemption };
  });
}
