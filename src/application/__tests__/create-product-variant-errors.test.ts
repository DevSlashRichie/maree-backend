import { describe, expect, it } from "bun:test";
import {
  AddedProductDoesNotExist,
  AddedProductIsNotIngredient,
  IncompatibleIngredientFlavor,
  IngredientsOnlyForCompleteProduct,
  InvalidIngredientQuantity,
  ProductAlreadyExists,
  ProductVariantAlreadyExists,
} from "@/application/errors/create-product-variant";

describe("Create Product Variant Errors", () => {
  describe("ProductVariantAlreadyExists", () => {
    it("should have correct code", () => {
      const error = new ProductVariantAlreadyExists();
      expect(error.code).toBe("product_variant_already_exists");
    });

    it("should have correct message", () => {
      const error = new ProductVariantAlreadyExists();
      expect(error.message).toBe("Product variant already exists");
    });
  });

  describe("ProductAlreadyExists", () => {
    it("should have correct code", () => {
      const error = new ProductAlreadyExists();
      expect(error.code).toBe("product_already_exists");
    });

    it("should have correct message", () => {
      const error = new ProductAlreadyExists();
      expect(error.message).toBe("Product already exists");
    });
  });

  describe("AddedProductDoesNotExist", () => {
    it("should have correct code", () => {
      const error = new AddedProductDoesNotExist("Queso");
      expect(error.code).toBe("added_product_does_not_exist");
    });

    it("should include product name in message", () => {
      const error = new AddedProductDoesNotExist("Queso");
      expect(error.message).toContain("Queso");
    });

    it("should handle empty name", () => {
      const error = new AddedProductDoesNotExist();
      expect(error.message).toContain("does not exist");
    });
  });

  describe("AddedProductIsNotIngredient", () => {
    it("should have correct code", () => {
      const error = new AddedProductIsNotIngredient();
      expect(error.code).toBe("added_product_is_not_ingredient");
    });

    it("should have correct message", () => {
      const error = new AddedProductIsNotIngredient();
      expect(error.message).toBe("Added product is not ingredient");
    });
  });

  describe("InvalidIngredientQuantity", () => {
    it("should have correct code", () => {
      const error = new InvalidIngredientQuantity();
      expect(error.code).toBe("invalid_ingredient_quantity");
    });

    it("should have correct message", () => {
      const error = new InvalidIngredientQuantity();
      expect(error.message).toBe(
        "Ingredient quantity must be an integer greater than 0",
      );
    });
  });

  describe("IngredientsOnlyForCompleteProduct", () => {
    it("should have correct code", () => {
      const error = new IngredientsOnlyForCompleteProduct();
      expect(error.code).toBe("ingredients_only_for_complete_product");
    });

    it("should have correct message", () => {
      const error = new IngredientsOnlyForCompleteProduct();
      expect(error.message).toBe("Only complete-product can have ingredients");
    });
  });

  describe("IncompatibleIngredientFlavor", () => {
    it("should have correct code", () => {
      const error = new IncompatibleIngredientFlavor();
      expect(error.code).toBe("incompatible_ingredient_flavor");
    });

    it("should have correct message", () => {
      const error = new IncompatibleIngredientFlavor();
      expect(error.message).toBe(
        "Ingredients are incompatible with product flavor family",
      );
    });
  });
});
