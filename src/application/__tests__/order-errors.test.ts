import { describe, expect, it } from "bun:test";
import {
  OrderAlreadyClosed,
  OrderAlreadyMark,
  OrderInvalidTransition,
  OrderNotFound,
} from "@/application/errors/order";

describe("Order Errors", () => {
  describe("OrderNotFound", () => {
    it("should have correct code", () => {
      const error = new OrderNotFound();
      expect(error.code).toBe("order_not_found");
    });

    it("should have correct message", () => {
      const error = new OrderNotFound();
      expect(error.message).toBe("Order not found");
    });
  });

  describe("OrderAlreadyClosed", () => {
    it("should have correct code", () => {
      const error = new OrderAlreadyClosed();
      expect(error.code).toBe("order_already_closed");
    });

    it("should have correct message", () => {
      const error = new OrderAlreadyClosed();
      expect(error.message).toBe("Order is already closed");
    });
  });

  describe("OrderAlreadyMark", () => {
    it("should have correct code", () => {
      const error = new OrderAlreadyMark();
      expect(error.code).toBe("order_already_mark_ready");
    });

    it("should have correct message", () => {
      const error = new OrderAlreadyMark();
      expect(error.message).toBe("Order is already mark ready");
    });
  });

  describe("OrderInvalidTransition", () => {
    it("should have correct code", () => {
      const error = new OrderInvalidTransition("pending", "to completed");
      expect(error.code).toBe("invalid_transition");
    });

    it("should include from and direction in message", () => {
      const error = new OrderInvalidTransition("pending", "to completed");
      expect(error.message).toContain("pending");
      expect(error.message).toContain("to completed");
    });
  });
});
