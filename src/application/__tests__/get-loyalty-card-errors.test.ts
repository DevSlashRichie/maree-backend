import { describe, expect, it } from "bun:test";
import {
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "@/application/errors/get-loyalty-card";

describe("Get Loyalty Card Errors", () => {
  describe("LoyaltyCardNotFound", () => {
    it("should have correct code", () => {
      const error = new LoyaltyCardNotFound("user-123");
      expect(error.code).toBe("LOYALTY_CARD_NOT_FOUND");
    });

    it("should include userId in message", () => {
      const error = new LoyaltyCardNotFound("user-123");
      expect(error.message).toContain("user-123");
    });

    it("should have correct name", () => {
      const error = new LoyaltyCardNotFound("user-123");
      expect(error.name).toBe("LoyaltyCardNotFoundError");
    });
  });

  describe("UnknownLoyaltyCardError", () => {
    it("should have correct code", () => {
      const error = new UnknownLoyaltyCardError();
      expect(error.code).toBe("UNKNOWN_ERROR");
    });

    it("should have correct message", () => {
      const error = new UnknownLoyaltyCardError();
      expect(error.message).toBe(
        "An unexpected error occurred while fetching the loyalty card",
      );
    });

    it("should have correct name", () => {
      const error = new UnknownLoyaltyCardError();
      expect(error.name).toBe("UnknownLoyaltyCardError");
    });
  });
});
