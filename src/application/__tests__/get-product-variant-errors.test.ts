import { describe, expect, it } from "bun:test";
import {
  ProductVariantNotFound,
  UnknownError,
} from "@/application/errors/get-product-variant";

describe("Get Product Variant Errors", () => {
  describe("ProductVariantNotFound", () => {
    it("should have correct code", () => {
      const error = new ProductVariantNotFound();
      expect(error.code).toBe("product_variant_not_found");
    });

    it("should have correct message", () => {
      const error = new ProductVariantNotFound();
      expect(error.message).toBe("Product variant not found");
    });
  });

  describe("UnknownError", () => {
    it("should have correct code", () => {
      const error = new UnknownError("test error");
      expect(error.code).toBe("unknown");
    });

    it("should include custom message", () => {
      const error = new UnknownError("custom error");
      expect(error.message).toContain("custom error");
    });
  });
});
