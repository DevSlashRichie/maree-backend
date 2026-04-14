import type { z } from "@hono/zod-openapi";
import { Err, Ok, type Result } from "oxide.ts";
import type { WalletPassPort } from "@/domain/ports/google-wallet-pass";
import { LoyaltyRepo } from "@/domain/repositories/loyalty-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type { GoogleWalletPassDto } from "../dtos/google-wallet";
import {
  type GetLoyaltyCardError,
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "../errors/get-loyalty-card";

export async function getLoyaltyGoogleWalletUseCase(
  userId: string,
  WalletClient: WalletPassPort,
): Promise<Result<z.infer<typeof GoogleWalletPassDto>, GetLoyaltyCardError>> {
  if (!userId?.trim()) {
    return Err(new LoyaltyCardNotFound(userId));
  }

  try {
    const loyaltyRepo = new LoyaltyRepo(DB);
    const userRepo = new UserRepo(DB);

    // Fetch user data and balance
    const [balance, user] = await Promise.all([
      loyaltyRepo.findCurrentBalance(userId),
      userRepo.findById(userId),
    ]);

    if (!user) {
      return Err(new LoyaltyCardNotFound(userId));
    }

    // Delegate pass generation to the Google Wallet provider
    const result = await WalletClient.generateLoyaltyPass({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      points: balance,
    });

    return Ok(result);
  } catch (error) {
    return Err(new UnknownLoyaltyCardError(error));
  }
}
