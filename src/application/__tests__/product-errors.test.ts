import { describe, expect, it } from "bun:test";
import { ProductAlreadyExists } from "@/application/errors/create-product";
import { ProductNotFound } from "@/application/errors/product";
import { InvalidProductStatusError } from "@/domain/value-objects/product-status";

describe("Product Errors", () => {
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

  describe("InvalidProductStatusError", () => {
    it("should have correct code", () => {
      const error = new InvalidProductStatusError("invalid");
      expect(error.code).toBe("INVALID_PRODUCT_STATUS");
    });

    it("should include the invalid status in message", () => {
      const error = new InvalidProductStatusError("invalid-status");
      expect(error.message).toContain("invalid-status");
    });
  });

  describe("ProductNotFound", () => {
    it("should have correct code", () => {
      const error = new ProductNotFound();
      expect(error.code).toBe("product_not_found");
    });

    it("should have correct message", () => {
      const error = new ProductNotFound();
      expect(error.message).toBe("Product not found");
    });
  });
});
