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

  it("should create valid status 'in-progress'", () => {
    const status = createOrderStatus("in-progress");
    expect(status).toBe("in-progress");
  });

  it("should create valid status 'ready'", () => {
    const status = createOrderStatus("ready");
    expect(status).toBe("ready");
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
      "in-progress",
      "ready",
      "completed",
    ]);
  });
});
