import { describe, expect, it } from "bun:test";
import { createReview } from "@/domain/entities/review";

const validParams = {
  orderId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  branchId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
  satisfactionRate: 4,
};

describe("createReview", () => {
  it("should create a review with valid params", () => {
    const review = createReview(validParams);
    expect(review.orderId).toBe(validParams.orderId);
    expect(review.userId).toBe(validParams.userId);
    expect(review.branchId).toBe(validParams.branchId);
    expect(Number(review.satisfactionRate)).toBe(4);
  });

  it("should create a review with notes", () => {
    const review = createReview({ ...validParams, notes: "Great service!" });
    expect(review.notes).toBe("Great service!");
  });

  it("should create a review without notes", () => {
    const review = createReview(validParams);
    expect(review.notes).toBeUndefined();
  });

  it("should throw for invalid orderId", () => {
    expect(() =>
      createReview({ ...validParams, orderId: "invalid-uuid" }),
    ).toThrow();
  });

  it("should throw for invalid userId", () => {
    expect(() =>
      createReview({ ...validParams, userId: "invalid-uuid" }),
    ).toThrow();
  });

  it("should throw for invalid branchId", () => {
    expect(() =>
      createReview({ ...validParams, branchId: "invalid-uuid" }),
    ).toThrow();
  });

  it("should throw for negative satisfaction rate", () => {
    expect(() =>
      createReview({ ...validParams, satisfactionRate: -1 }),
    ).toThrow();
  });

  it("should throw for satisfaction rate > 5", () => {
    expect(() =>
      createReview({ ...validParams, satisfactionRate: 6 }),
    ).toThrow();
  });

  it("should throw for decimal satisfaction rate", () => {
    expect(() =>
      createReview({ ...validParams, satisfactionRate: 3.5 }),
    ).toThrow();
  });
});
