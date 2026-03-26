import { describe, expect, it } from "bun:test";
import { createReward } from "@/domain/entities/reward";
import { InvalidRewardCostError } from "@/domain/value-objects/reward-cost";

const validParams = {
  name: "Free Coffee",
  description: "Get a free coffee",
  status: "active",
  cost: 100n,
  discountId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
};

describe("createReward", () => {
  it("should create reward with valid params", () => {
    const reward = createReward(validParams);
    expect(reward.name).toBe("Free Coffee");
    expect(reward.description).toBe("Get a free coffee");
    expect(reward.status).toBe("active");
    expect(Number(reward.cost)).toBe(100);
    expect(reward.discountId).toBe(validParams.discountId);
  });

  it("should create reward with image", () => {
    const reward = createReward({
      ...validParams,
      image: "https://example.com/reward.jpg",
    });
    expect(reward.image).toBe("https://example.com/reward.jpg");
  });

  it("should create reward without image", () => {
    const reward = createReward(validParams);
    expect(reward.image).toBeUndefined();
  });

  it("should throw for empty name", () => {
    expect(() => createReward({ ...validParams, name: "" })).toThrow();
  });

  it("should throw for empty description", () => {
    expect(() => createReward({ ...validParams, description: "" })).toThrow();
  });

  it("should throw for zero cost", () => {
    expect(() => createReward({ ...validParams, cost: 0n })).toThrow(
      InvalidRewardCostError,
    );
  });

  it("should throw for negative cost", () => {
    expect(() => createReward({ ...validParams, cost: -100n })).toThrow(
      InvalidRewardCostError,
    );
  });

  it("should throw for invalid image URL", () => {
    expect(() =>
      createReward({ ...validParams, image: "not-a-url" }),
    ).toThrow();
  });

  it("should throw for invalid discountId", () => {
    expect(() =>
      createReward({ ...validParams, discountId: "invalid-uuid" }),
    ).toThrow();
  });
});
