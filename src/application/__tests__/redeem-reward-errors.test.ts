import { describe, expect, it } from "bun:test";
import {
  InsufficientPointsError,
  LoyaltyCardNotFoundError,
  RewardAlreadyRedeemedError,
  RewardNotFoundError,
} from "@/application/errors/redeem-reward";

describe("Redeem Reward Errors", () => {
  describe("InsufficientPointsError", () => {
    it("should have correct code", () => {
      const error = new InsufficientPointsError(100n, 50n);
      expect(error.code).toBe("insufficient_points");
    });

    it("should have correct message", () => {
      const error = new InsufficientPointsError(100n, 50n);
      expect(error.message).toBe("Insufficient points to redeem this reward");
    });

    it("should store required and available points", () => {
      const error = new InsufficientPointsError(100n, 50n);
      expect(error.required).toBe(100n);
      expect(error.available).toBe(50n);
    });
  });

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

  describe("LoyaltyCardNotFoundError", () => {
    it("should have correct code", () => {
      const error = new LoyaltyCardNotFoundError();
      expect(error.code).toBe("loyalty_card_not_found");
    });

    it("should have correct message", () => {
      const error = new LoyaltyCardNotFoundError();
      expect(error.message).toBe("Loyalty card not found");
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
});
