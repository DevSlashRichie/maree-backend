export type IngredientQuantity = number & { readonly brand: unique symbol };

export function createIngredientQuantity(quantity: number): IngredientQuantity {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidIngredientQuantityError(quantity);
  }

  return quantity as IngredientQuantity;
}

export class InvalidIngredientQuantityError extends Error {
  readonly code = "INVALID_INGREDIENT_QUANTITY";

  constructor(quantity: number) {
    super(
      `Ingredient quantity ${quantity} is invalid. Must be an integer greater than 0.`,
    );
    this.name = "InvalidIngredientQuantityError";
  }
}
