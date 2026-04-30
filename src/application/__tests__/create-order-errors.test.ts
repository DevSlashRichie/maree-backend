import { describe, expect, it } from "bun:test";
import {
  InsufficientPointsError,
  ModifierMustBeIngredientError,
  ProductVariantNotFoundError,
  RewardAlreadyRedeemedError,
  RewardDiscountMismatchError,
  RewardNotFoundError,
} from "@/application/errors/create-order";

describe("Create Order Errors", () => {
  describe("RewardNotFoundError", () => {
    it("should have correct code", () => {
      const error = new RewardNotFoundError();
      expect(error.code).toBe("reward_not_found");
    });

    it("should have correct message", () => {
      const error = new RewardNotFoundError();
      expect(error.message).toBe("Reward not found");
    });
  });

  describe("RewardAlreadyRedeemedError", () => {
    it("should have correct code", () => {
      const error = new RewardAlreadyRedeemedError();
      expect(error.code).toBe("reward_already_redeemed");
    });

    it("should have correct message", () => {
      const error = new RewardAlreadyRedeemedError();
      expect(error.message).toBe(
        "This reward has already been redeemed by the user",
      );
    });
  });

  describe("InsufficientPointsError", () => {
    it("should have correct code", () => {
      const error = new InsufficientPointsError(100n, 50n);
      expect(error.code).toBe("insufficient_points");
    });

    it("should store required and available", () => {
      const error = new InsufficientPointsError(100n, 50n);
      expect(error.required).toBe(100n);
      expect(error.available).toBe(50n);
    });
  });

  describe("RewardDiscountMismatchError", () => {
    it("should have correct code", () => {
      const error = new RewardDiscountMismatchError();
      expect(error.code).toBe("reward_discount_mismatch");
    });

    it("should have correct message", () => {
      const error = new RewardDiscountMismatchError();
      expect(error.message).toBe(
        "The provided discount does not belong to the provided reward",
      );
    });
  });

  describe("ProductVariantNotFoundError", () => {
    it("should have correct code", () => {
      const error = new ProductVariantNotFoundError("variant-123");
      expect(error.code).toBe("product_variant_not_found");
    });

    it("should include variantId in message", () => {
      const error = new ProductVariantNotFoundError("variant-123");
      expect(error.message).toContain("variant-123");
    });
  });

  describe("ModifierMustBeIngredientError", () => {
    it("should have correct code", () => {
      const error = new ModifierMustBeIngredientError("variant-123");
      expect(error.code).toBe("modifier_must_be_ingredient");
    });

    it("should include variantId in message", () => {
      const error = new ModifierMustBeIngredientError("variant-123");
      expect(error.message).toContain("variant-123");
    });
  });
});
