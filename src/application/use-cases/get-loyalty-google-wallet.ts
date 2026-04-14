// application/use-cases/get-loyalty-google-wallet.ts
import { Err, Ok, type Result } from "oxide.ts";
import type { z } from "zod";
import type { GoogleWalletPassDto } from "@/application/dtos/google-wallet";
import type { GetLoyaltyCardError } from "@/application/errors/get-loyalty-card";
import {
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "@/application/errors/get-loyalty-card";
import type { WalletPassPort } from "@/domain/ports/wallet-pass";
import { LoyaltyRepo } from "@/domain/repositories/loyalty-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getLoyaltyGoogleWalletUseCase(
  userId: string,
  walletClient: WalletPassPort, // inyectado desde la route, igual que el encryptKey en login
): Promise<Result<z.infer<typeof GoogleWalletPassDto>, GetLoyaltyCardError>> {
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

    return Ok(result);
  } catch (error) {
    return Err(new UnknownLoyaltyCardError(error));
  }
}
