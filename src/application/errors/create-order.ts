import { ApplicationError } from "@/application/error.ts";

export abstract class CreateOrderError extends ApplicationError {
  abstract override readonly code: string;
}

export class RewardNotFoundError extends CreateOrderError {
  readonly code = "reward_not_found";

  constructor() {
    super("Reward not found");
  }
}

export class RewardAlreadyRedeemedError extends CreateOrderError {
  readonly code = "reward_already_redeemed";

  constructor() {
    super("This reward has already been redeemed by the user");
  }
}

export class InsufficientPointsError extends CreateOrderError {
  readonly code = "insufficient_points";
  readonly required: bigint;
  readonly available: bigint;

  constructor(required: bigint, available: bigint) {
    super("Insufficient points to redeem this reward");
    this.required = required;
    this.available = available;
  }
}

export class RewardDiscountMismatchError extends CreateOrderError {
  readonly code = "reward_discount_mismatch";

  constructor() {
    super("The provided discount does not belong to the provided reward");
  }
}

export class ProductVariantNotFoundError extends CreateOrderError {
  readonly code = "product_variant_not_found";

  constructor(variantId: string) {
    super(`Product variant not found: ${variantId}`);
  }
}

export class ModifierMustBeIngredientError extends CreateOrderError {
  readonly code = "modifier_must_be_ingredient";

  constructor(variantId: string) {
    super(
      `Modifier variant must belong to an ingredient product: ${variantId}`,
    );
  }
}

export class UnknownCreateOrderError extends CreateOrderError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
