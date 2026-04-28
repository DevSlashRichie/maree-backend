export interface WalletPassData {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  points: number;
}

export interface WalletPassResult {
  signedJWT: string;
  saveURL: string;
}

export interface WalletPassPort {
  generateLoyaltyPass(data: WalletPassData): Promise<WalletPassResult>;
}
