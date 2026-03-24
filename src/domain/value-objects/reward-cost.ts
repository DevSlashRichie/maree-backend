export type RewardCost = bigint & { readonly brand: unique symbol };

export function createRewardCost(cost: bigint): RewardCost {
  if (cost <= 0n) {
    throw new InvalidRewardCostError(cost);
  }
  return cost as RewardCost;
}

export class InvalidRewardCostError extends Error {
  readonly code = "INVALID_REWARD_COST";

  constructor(cost: bigint) {
    super(`Reward cost ${cost} is invalid. Must be greater than 0.`);
    this.name = "InvalidRewardCostError";
  }
}
