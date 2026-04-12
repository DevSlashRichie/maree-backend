import { ApplicationError } from "@/application/error.ts";

export abstract class CreateOrderError extends ApplicationError {
  abstract override readonly code: string;
}

export class TotalMismatchError extends CreateOrderError {
  readonly code = "total_mismatch";

  constructor() {
    super("Order total does not match the server calculation");
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
    super(`Modifier variant must belong to an ingredient product: ${variantId}`);
  }
}

export class UnknownCreateOrderError extends CreateOrderError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
