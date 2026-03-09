import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import { RegisterReviewDto } from "@/domain/dtos/register-review";
import { RegisterReviewError, type ReviewType } from "@/domain/entities/review";
import { ReviewRepo } from "@/domain/repositories/review-repo";
import { DB } from "@/infrastructure/db/postgres";
import { UnknownError } from "@/domain/entities/user";


export async function registerReviewUseCase(data: z.infer<typeof RegisterReviewDto>,): Promise<Result<ReviewType, RegisterReviewError>> {
    try {
        const reviewRepo = new ReviewRepo(DB);
        const review = await reviewRepo.saveReview(data);
        return Ok(review);
    } catch (error) {
        if (error instanceof RegisterReviewError) {
            return Err(error);
        }
        return Err(
            new UnknownError (
                error instanceof Error ? error.message : "unknown error",
            ),
        );
    }
} 