import { ApplicationError } from "@/application/error.ts";

export abstract class CreateProductVariantError extends ApplicationError {
  abstract override readonly code: string;
}

export class ProductVariantAlreadyExists extends CreateProductVariantError {
  readonly code = "product_variant_already_exists";

  constructor() {
    super("Product variant already exists");
  }
}

export class ProductAlreadyExists extends CreateProductVariantError {
  readonly code = "product_already_exists";

  constructor() {
    super("Product already exists");
  }
}

export class AddedProductDoesNotExist extends CreateProductVariantError {
  readonly code = "added_product_does_not_exist";

  constructor(name?: string) {
    super(`Added product: ${name ? name : ""}, does not exist`);
  }
}

export class AddedProductIsNotIngredient extends CreateProductVariantError {
  readonly code = "added_product_is_not_ingredient";

  constructor() {
    super("Added product is not ingredient");
  }
}

export class UnknownError extends CreateProductVariantError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
