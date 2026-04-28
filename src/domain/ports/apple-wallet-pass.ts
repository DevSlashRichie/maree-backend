export interface AppleWalletPassData {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  points: number;
}

export interface AppleWalletPassResult {
  pkpassBuffer: Buffer;
}

export interface AppleWalletPassPort {
  generateLoyaltyPass(
    data: AppleWalletPassData,
  ): Promise<AppleWalletPassResult>;
}
