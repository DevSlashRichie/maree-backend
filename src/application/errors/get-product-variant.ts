import { ApplicationError } from "@/application/error.ts";

export abstract class GetProductVariantError extends ApplicationError {
  abstract override readonly code: string;
}

export class ProductVariantNotFound extends GetProductVariantError {
  readonly code = "product_variant_not_found";

  constructor() {
    super("Product variant not found");
  }
}

export class UnknownError extends GetProductVariantError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
