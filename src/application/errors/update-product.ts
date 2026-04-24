import { ApplicationError } from "@/application/error.ts";

export abstract class UpdateProductAndVariantError extends ApplicationError {
  abstract override readonly code: string;
}

export class ProductVariantNotFound extends UpdateProductAndVariantError {
  readonly code = "product_variant_not_found";

  constructor() {
    super("Product variant not found");
  }
}

export class AddedProductDoesNotExist extends UpdateProductAndVariantError {
  readonly code = "added_product_does_not_exist";

  constructor(name?: string) {
    super(`Added product: ${name ? name : ""}, does not exist`);
  }
}

export class AddedProductIsNotIngredient extends UpdateProductAndVariantError {
  readonly code = "added_product_is_not_ingredient";

  constructor() {
    super("Added product is not ingredient");
  }
}

export class InvalidIngredientQuantity extends UpdateProductAndVariantError {
  readonly code = "invalid_ingredient_quantity";

  constructor() {
    super("Ingredient quantity must be an integer greater than 0");
  }
}

export class IngredientsOnlyForCompleteProduct extends UpdateProductAndVariantError {
  readonly code = "ingredients_only_for_complete_product";

  constructor() {
    super("Only complete-product can have ingredients");
  }
}

export class IncompatibleIngredientFlavor extends UpdateProductAndVariantError {
  readonly code = "incompatible_ingredient_flavor";

  constructor() {
    super("Ingredients are incompatible with product flavor family");
  }
}
