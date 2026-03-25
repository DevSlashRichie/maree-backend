import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { CreateRewardDto } from "@/application/dtos/reward";
import { UnknownError } from "@/application/error";
import {
  createDiscount,
  DEFAULT_COUPON_MAX_USES,
  DEFAULT_DISCOUNT_STATE,
  generateCouponCode,
  getDefaultDiscountDates,
} from "@/domain/entities/discount";
import { createReward, type Reward } from "@/domain/entities/reward";
import { isKnownError } from "@/domain/errors";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { DB } from "@/infrastructure/db/postgres";

export abstract class CreateRewardError extends Error {
  abstract readonly code: string;
}

export class DiscountRequiredError extends CreateRewardError {
  readonly code = "DISCOUNT_REQUIRED";

  constructor() {
    super("Discount is required");
  }
}

export class DiscountCreationError extends CreateRewardError {
  readonly code = "DISCOUNT_CREATION_FAILED";

  constructor() {
    super("Failed to create discount");
  }
}

export class RewardCreationError extends CreateRewardError {
  readonly code = "REWARD_CREATION_FAILED";

  constructor() {
    super("Failed to create reward");
  }
}

export async function createRewardUseCase(
  data: z.infer<typeof CreateRewardDto>,
): Promise<Result<Reward, CreateRewardError>> {
  const discountData = data.discount;
  if (!discountData) {
    return Err(new DiscountRequiredError());
  }

  try {
    return await DB.transaction(async (txn) => {
      const discountRepo = new DiscountRepo(txn);
      const rewardsRepo = new RewardsRepo(txn);

      const couponCode = generateCouponCode();
      const { startDate, endDate } = getDefaultDiscountDates();

      const validatedDiscount = createDiscount({
        name: `REWARD-${data.name}`,
        type: discountData.type,
        value: discountData.value,
        appliesTo: discountData.appliesTo,
        state: DEFAULT_DISCOUNT_STATE,
        startDate,
        endDate,
        code: couponCode,
        maxUses: DEFAULT_COUPON_MAX_USES,
        hidden: true,
      });

      const discount = await discountRepo.saveDiscount(validatedDiscount);

      if (!discount) {
        return Err(new DiscountCreationError());
      }

      const validatedReward = createReward({
        name: data.name,
        description: data.description,
        status: data.status,
        cost: data.cost,
        discountId: discount.id,
        image: data.image,
      });

      const reward = await rewardsRepo.saveReward(validatedReward);

      if (!reward) {
        return Err(new RewardCreationError());
      }

      const rewardWithDiscount = await rewardsRepo.findRewardWithDiscount(
        reward.id,
      );

      return Ok({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        status: reward.status,
        cost: reward.cost,
        createdAt: reward.createdAt,
        deletedAt: reward.deletedAt,
        discountId: reward.discountId,
        image: reward.image,
        discount: rewardWithDiscount?.discountsTable,
      } as Reward);
    });
  } catch (error) {
    if (isKnownError(error)) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
