import { Err, Ok, type Result } from "oxide.ts";
import {
  type GetLoyaltyCardError,
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "@/application/errors/get-loyalty-card";
import type { LoyaltyCard } from "@/domain/entities/loyalty";
import { LoyaltyRepo } from "@/domain/repositories/loyalty-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getLoyaltyCardUseCase(
  userId: string,
): Promise<Result<LoyaltyCard, GetLoyaltyCardError>> {
  try {
    const loyaltyRepo = new LoyaltyRepo(DB);
    const loyaltyCard = await loyaltyRepo.findLoyaltyCardByUserId(userId);

    if (!loyaltyCard) {
      return Err(new LoyaltyCardNotFound(userId));
    }

    return Ok(loyaltyCard);
  } catch (error) {
    return Err(new UnknownLoyaltyCardError());
  }
}
