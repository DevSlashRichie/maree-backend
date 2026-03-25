import { describe, expect, it } from "bun:test";
import {
  createRewardCost,
  InvalidRewardCostError,
} from "@/domain/value-objects/reward-cost";

describe("RewardCost", () => {
  it("should create valid cost of 1", () => {
    const cost = createRewardCost(1n);
    expect(cost).toBeDefined();
    expect(Number(cost)).toBe(1);
  });

  it("should create valid cost of 100", () => {
    const cost = createRewardCost(100n);
    expect(cost).toBeDefined();
    expect(Number(cost)).toBe(100);
  });

  it("should create valid cost of 1000", () => {
    const cost = createRewardCost(1000n);
    expect(cost).toBeDefined();
    expect(Number(cost)).toBe(1000);
  });

  it("should throw for zero", () => {
    expect(() => createRewardCost(0n)).toThrow(InvalidRewardCostError);
  });

  it("should throw for negative number", () => {
    expect(() => createRewardCost(-1n)).toThrow(InvalidRewardCostError);
  });

  it("should throw for negative large number", () => {
    expect(() => createRewardCost(-1000n)).toThrow(InvalidRewardCostError);
  });
});
