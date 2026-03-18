import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import { RegisterReviewDto } from "@/domain/dtos/register-review";
import { InvalidSatisfactionRateError, RegisterReviewError, UserNotFoundError, type ReviewType } from "@/domain/entities/review";
import { UnknownError } from "@/domain/entities/user";
import { ReviewRepo } from "@/domain/repositories/review-repo";
import { DB } from "@/infrastructure/db/postgres";
import { UserRepo } from "@/domain/repositories/user-repo";

export async function registerReviewUseCase(
  data: z.infer<typeof RegisterReviewDto>,
): Promise<Result<ReviewType, RegisterReviewError>> {
  try {
    const reviewRepo = new ReviewRepo(DB);
    const userRepo = new UserRepo(DB);

    if(data.satisfactionRate < 0 || data.satisfactionRate > 5){
      return Err(new InvalidSatisfactionRateError (data.satisfactionRate));
    }

    const userExists = await userRepo.findById(data.userId);
    if(!userExists) return Err(new UserNotFoundError(data.userId)); 

    const review = await reviewRepo.saveReview(data);
    return Ok(review);
  } catch (error) {
    if (error instanceof RegisterReviewError) {
      return Err(error);
    }
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
