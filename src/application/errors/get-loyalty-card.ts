export abstract class GetLoyaltyCardError extends Error {
  abstract readonly code: string;
}

export class LoyaltyCardNotFound extends GetLoyaltyCardError {
  readonly code = "LOYALTY_CARD_NOT_FOUND";

  constructor(userId: string) {
    super(`Loyalty card not found for user ${userId}`);
    this.name = "LoyaltyCardNotFoundError";
  }
}

export class UnknownLoyaltyCardError extends GetLoyaltyCardError {
  readonly code = "UNKNOWN_ERROR";
  constructor(cause?: unknown) {
    super("An unexpected error occurred while fetching the loyalty card", {
      cause,
    });
    this.name = "UnknownLoyaltyCardError";
  }
}
