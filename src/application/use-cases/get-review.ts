import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import {
  type GetReviewError,
  ReviewNotFoundError,
} from "@/application/errors/get-review";
import type { ReviewType } from "@/domain/entities/review";
import { ReviewRepo } from "@/domain/repositories/review-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getReviewUseCase(
  orderId: string,
): Promise<Result<ReviewType, GetReviewError | UnknownError>> {
  try {
    const reviewRepo = new ReviewRepo(DB);
    const review = await reviewRepo.findReviewByOrderId(orderId);

    if (!review) {
      return Err(new ReviewNotFoundError(orderId));
    }

    return Ok(review);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
