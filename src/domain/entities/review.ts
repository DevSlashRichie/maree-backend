import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { reviewsTable } from "@/infrastructure/db/schema";

export type ReviewType = InferSelectModel<typeof reviewsTable>;

export const ReviewSchema = createSelectSchema(reviewsTable);

export abstract class RegisterReviewError extends Error {
  abstract readonly code: string;
}

export class InvalidSatisfactionRateError extends RegisterReviewError {
  readonly code = "INVALID_SATISFACTION_RATE";

  constructor(rate: number) {
    super(`Satisfaction rate ${rate} is invalid.`);
    this.name = "InvalidSatisfactionRateError";
  } 
}

export class UserNotFoundError extends RegisterReviewError {
  readonly code = "USER_NOT_FOUND";

  constructor(userId: string) {
    super(`User with ID ${userId} was not found.`);
    this.name = "UserNotFoundError";
  }
}

export class OrderNotFoundError extends RegisterReviewError {
  readonly code = "ORDER_NOT_FOUND";

  constructor(orderId: string) {
    super(`Order with ID ${orderId} was not found.`);
    this.name = "OrderNotFoundError";
  }
}

export class UnknownError extends RegisterReviewError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
