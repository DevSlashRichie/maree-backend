import { describe, expect, it } from "bun:test";
import {
  OrderNotFoundError,
  UserNotFoundError,
} from "@/application/errors/register-review";

describe("Register Review Errors", () => {
  describe("UserNotFoundError", () => {
    it("should have correct code", () => {
      const error = new UserNotFoundError("user-123");
      expect(error.code).toBe("USER_NOT_FOUND");
    });

    it("should include userId in message", () => {
      const error = new UserNotFoundError("user-123");
      expect(error.message).toContain("user-123");
    });

    it("should have correct name", () => {
      const error = new UserNotFoundError("user-123");
      expect(error.name).toBe("UserNotFoundError");
    });
  });

  describe("OrderNotFoundError", () => {
    it("should have correct code", () => {
      const error = new OrderNotFoundError("order-123");
      expect(error.code).toBe("ORDER_NOT_FOUND");
    });

    it("should include orderId in message", () => {
      const error = new OrderNotFoundError("order-123");
      expect(error.message).toContain("order-123");
    });

    it("should have correct name", () => {
      const error = new OrderNotFoundError("order-123");
      expect(error.name).toBe("OrderNotFoundError");
    });
  });
});
