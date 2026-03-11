import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { reviewsTable } from "@/infrastructure/db/schema";

export type ReviewType = InferSelectModel<typeof reviewsTable>;

export const ReviewSchema = createSelectSchema(reviewsTable);

export abstract class RegisterReviewError extends Error {
  abstract readonly code: string;
}

export class UnknownError extends RegisterReviewError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
