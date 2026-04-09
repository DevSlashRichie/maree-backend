import { describe, expect, it } from "bun:test";
import {
  createIngredientQuantity,
  InvalidIngredientQuantityError,
} from "@/domain/value-objects/ingredient-quantity";

describe("IngredientQuantity", () => {
  it("should create valid quantity of 1", () => {
    const quantity = createIngredientQuantity(1);
    expect(Number(quantity)).toBe(1);
  });

  it("should create valid quantity of 5", () => {
    const quantity = createIngredientQuantity(5);
    expect(Number(quantity)).toBe(5);
  });

  it("should throw for zero", () => {
    expect(() => createIngredientQuantity(0)).toThrow(
      InvalidIngredientQuantityError,
    );
  });

  it("should throw for negative numbers", () => {
    expect(() => createIngredientQuantity(-1)).toThrow(
      InvalidIngredientQuantityError,
    );
  });

  it("should throw for decimal numbers", () => {
    expect(() => createIngredientQuantity(0.5)).toThrow(
      InvalidIngredientQuantityError,
    );
  });
});
