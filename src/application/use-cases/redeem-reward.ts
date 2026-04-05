export type RedeemRewardInput = {
  userId: string;
  rewardId: string;
  branchId: string;
};

export async function redeemRewardUseCase(_input: RedeemRewardInput) {
  // TODO: Create this user case

  return { newBalance: 0n };
}
