import { Err, Ok, type Result } from "oxide.ts";
import type { AppleWalletPassPort } from "@/domain/ports/apple-wallet-pass";
import { LoyaltyRepo } from "@/domain/repositories/loyalty-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import {
  type GetLoyaltyCardError,
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "../errors/get-loyalty-card";

export async function getLoyaltyAppleWalletUseCase(
  userId: string,
  walletClient: AppleWalletPassPort,
): Promise<Result<Buffer, GetLoyaltyCardError>> {
  if (!userId?.trim()) {
    return Err(new LoyaltyCardNotFound(userId));
  }

  try {
    const loyaltyRepo = new LoyaltyRepo(DB);
    const userRepo = new UserRepo(DB);

    const [balance, user] = await Promise.all([
      loyaltyRepo.findCurrentBalance(userId),
      userRepo.findById(userId),
    ]);

    if (!user) {
      return Err(new LoyaltyCardNotFound(userId));
    }

    const result = await walletClient.generateLoyaltyPass({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      points: balance,
    });

    return Ok(result.pkpassBuffer);
  } catch (error) {
    return Err(new UnknownLoyaltyCardError(error));
  }
}
