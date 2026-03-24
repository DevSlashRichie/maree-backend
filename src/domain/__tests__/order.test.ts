import { describe, expect, it } from "bun:test";
import { createOrder, InvalidOrderTotalError } from "@/domain/entities/order";
import { InvalidOrderStatusError } from "@/domain/value-objects/order-status";

const validParams = {
  userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  branchId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  discountId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
  total: 1000n,
  status: "pending",
  orderNumber: "ORD-001",
};

describe("createOrder", () => {
  it("should create order with valid params", () => {
    const order = createOrder(validParams);
    expect(order.userId).toBe(validParams.userId);
    expect(order.branchId).toBe(validParams.branchId);
    expect(order.discountId).toBe(validParams.discountId);
    expect(Number(order.total)).toBe(1000);
    expect(order.status).toBe("pending");
    expect(order.orderNumber).toBe("ORD-001");
  });

  it("should create order with note", () => {
    const order = createOrder({ ...validParams, note: "Test note" });
    expect(order.note).toBe("Test note");
  });

  it("should create order without note", () => {
    const order = createOrder(validParams);
    expect(order.note).toBeUndefined();
  });

  it("should throw for invalid userId", () => {
    expect(() => createOrder({ ...validParams, userId: "invalid" })).toThrow();
  });

  it("should throw for invalid branchId", () => {
    expect(() =>
      createOrder({ ...validParams, branchId: "invalid" }),
    ).toThrow();
  });

  it("should throw for invalid discountId", () => {
    expect(() =>
      createOrder({ ...validParams, discountId: "invalid" }),
    ).toThrow();
  });

  it("should throw for zero total", () => {
    expect(() => createOrder({ ...validParams, total: 0n })).toThrow(
      InvalidOrderTotalError,
    );
  });

  it("should throw for negative total", () => {
    expect(() => createOrder({ ...validParams, total: -100n })).toThrow(
      InvalidOrderTotalError,
    );
  });

  it("should throw for invalid status", () => {
    expect(() => createOrder({ ...validParams, status: "invalid" })).toThrow(
      InvalidOrderStatusError,
    );
  });

  it("should throw for empty orderNumber", () => {
    expect(() => createOrder({ ...validParams, orderNumber: "" })).toThrow();
  });
});
