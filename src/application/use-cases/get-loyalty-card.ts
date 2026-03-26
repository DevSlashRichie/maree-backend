import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import { LoyaltyCardDetailsDto } from "@/application/dtos/reward";
import {
  type GetLoyaltyCardError,
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "@/application/errors/get-loyalty-card";
import { LoyaltyRepo } from "@/domain/repositories/loyalty-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getLoyaltyCardUseCase(
  userId: string,
): Promise<Result<z.infer<typeof LoyaltyCardDetailsDto>, GetLoyaltyCardError>> {
  try {
    const loyaltyRepo = new LoyaltyRepo(DB);
    const userRepo = new UserRepo(DB);
    const [balance, user, lastRedemptions] = await Promise.all([
      loyaltyRepo.findCurrentBalance(userId),
      userRepo.findById(userId),
      loyaltyRepo.findLastRedemptions(userId, 3),
    ]);

    if (!user) {
      return Err(new LoyaltyCardNotFound(userId));
    }

    const loyaltyCardDetails = LoyaltyCardDetailsDto.parse({
      currentBalance: balance,
      firstName: user.firstName,
      LastName: user.lastName,
      phone: user.phone,
      lastRedemptions: lastRedemptions.join(", "),
    });

    return Ok(loyaltyCardDetails);
  } catch (error) {
    return Err(new UnknownLoyaltyCardError());
  }
}
