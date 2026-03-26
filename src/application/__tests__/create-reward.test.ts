import { describe, expect, it } from "bun:test";
import { createReward } from "@/domain/entities/reward";

describe("createReward (domain)", () => {
  const validParams = {
    name: "Free Coffee",
    description: "Get a free coffee",
    status: "active",
    cost: 100n,
    discountId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  };

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
      image: "https://example.com/image.jpg",
    });
    expect(reward.image).toBe("https://example.com/image.jpg");
  });

  it("should throw for empty name", () => {
    expect(() => createReward({ ...validParams, name: "" })).toThrow();
  });

  it("should throw for empty description", () => {
    expect(() => createReward({ ...validParams, description: "" })).toThrow();
  });

  it("should throw for zero cost", () => {
    expect(() => createReward({ ...validParams, cost: 0n })).toThrow();
  });

  it("should throw for negative cost", () => {
    expect(() => createReward({ ...validParams, cost: -100n })).toThrow();
  });
});
