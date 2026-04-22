import { describe, expect, it } from "bun:test";
import {
  createOrderStatus,
  InvalidOrderStatusError,
  ORDER_STATUSES,
} from "@/domain/value-objects/order-status";

describe("OrderStatus", () => {
  it("should create valid status 'pending'", () => {
    const status = createOrderStatus("pending");
    expect(status).toBe("pending");
  });

  it("should create valid status 'incoming'", () => {
    const status = createOrderStatus("incoming");
    expect(status).toBe("incoming");
  });

  it("should create valid status 'set'", () => {
    const status = createOrderStatus("set");
    expect(status).toBe("set");
  });

  it("should create valid status 'completed'", () => {
    const status = createOrderStatus("completed");
    expect(status).toBe("completed");
  });

  it("should throw for invalid status", () => {
    expect(() => createOrderStatus("invalid")).toThrow(InvalidOrderStatusError);
  });

  it("should throw for empty string", () => {
    expect(() => createOrderStatus("")).toThrow(InvalidOrderStatusError);
  });

  it("should have correct ORDER_STATUSES constant", () => {
    expect(ORDER_STATUSES).toEqual([
      "pending",
      "incoming",
      "set",
      "ready",
      "completed",
      "in-progress",
    ]);
  });
});
