import { describe, expect, it } from "bun:test";
import { ReviewNotFoundError } from "@/application/errors/get-review";

describe("Get Review Errors", () => {
  describe("ReviewNotFoundError", () => {
    it("should have correct code", () => {
      const error = new ReviewNotFoundError("order-123");
      expect(error.code).toBe("REVIEW_NOT_FOUND");
    });

    it("should include orderId in message", () => {
      const error = new ReviewNotFoundError("order-123");
      expect(error.message).toContain("order-123");
    });

    it("should have correct name", () => {
      const error = new ReviewNotFoundError("order-123");
      expect(error.name).toBe("ReviewNotFoundError");
    });
  });
});
