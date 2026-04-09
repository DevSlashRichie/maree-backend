import { describe, expect, it } from "bun:test";
import {
  IncompatibleIngredientFlavorError,
  IngredientsOnlyForCompleteProductError,
  validateIngredientComposition,
} from "@/domain/value-objects/ingredient-composition";

const categories = [
  { id: "cp", name: "Complete Products", parentId: null },
  { id: "cp-dulce", name: "Dulces", parentId: "cp" },
  { id: "cp-salado", name: "Salados", parentId: "cp" },
  { id: "cp-waffle", name: "Waffles", parentId: "cp" },
  { id: "ing", name: "Ingredientes", parentId: null },
  { id: "ing-dulce", name: "Dulce", parentId: "ing" },
  { id: "ing-salado", name: "Salado", parentId: "ing" },
  { id: "ing-neutral", name: "Frutas", parentId: "ing" },
] as const;

describe("validateIngredientComposition", () => {
  it("should allow complete-product without ingredients", () => {
    expect(() =>
      validateIngredientComposition({
        productType: "complete-product",
        productCategoryId: "cp-dulce",
        ingredientCategoryIds: [],
        categories: [...categories],
      }),
    ).not.toThrow();
  });

  it("should reject ingredients when product is ingredient", () => {
    expect(() =>
      validateIngredientComposition({
        productType: "ingredient",
        productCategoryId: "ing-dulce",
        ingredientCategoryIds: ["ing-dulce"],
        categories: [...categories],
      }),
    ).toThrow(IngredientsOnlyForCompleteProductError);
  });

  it("should allow dulce complete-product with dulce ingredients", () => {
    expect(() =>
      validateIngredientComposition({
        productType: "complete-product",
        productCategoryId: "cp-dulce",
        ingredientCategoryIds: ["ing-dulce"],
        categories: [...categories],
      }),
    ).not.toThrow();
  });

  it("should reject salado ingredient on dulce complete-product", () => {
    expect(() =>
      validateIngredientComposition({
        productType: "complete-product",
        productCategoryId: "cp-dulce",
        ingredientCategoryIds: ["ing-salado"],
        categories: [...categories],
      }),
    ).toThrow(IncompatibleIngredientFlavorError);
  });

  it("should allow any ingredient when complete-product category has no flavor", () => {
    expect(() =>
      validateIngredientComposition({
        productType: "complete-product",
        productCategoryId: "cp-waffle",
        ingredientCategoryIds: ["ing-dulce", "ing-salado", "ing-neutral"],
        categories: [...categories],
      }),
    ).not.toThrow();
  });
});

