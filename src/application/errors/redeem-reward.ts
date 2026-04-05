import { ApplicationError } from "@/application/error";

export abstract class RedeemRewardError extends ApplicationError {
  abstract override readonly code: string;
}

export class InsufficientPointsError extends RedeemRewardError {
  readonly code = "insufficient_points";
  readonly required: bigint;
  readonly available: bigint;

  constructor(required: bigint, available: bigint) {
    super("Insufficient points to redeem this reward");
    this.required = required;
    this.available = available;
  }
}

export class RewardNotFoundError extends RedeemRewardError {
  readonly code = "reward_not_found";

  constructor() {
    super("Reward not found");
  }
}

export class LoyaltyCardNotFoundError extends RedeemRewardError {
  readonly code = "loyalty_card_not_found";

  constructor() {
    super("Loyalty card not found");
  }
}

export class RewardAlreadyRedeemedError extends RedeemRewardError {
  readonly code = "reward_already_redeemed";

  constructor() {
    super("This reward has already been redeemed by the user");
  }
}
