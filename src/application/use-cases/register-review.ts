import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { RegisterReviewDto } from "@/application/dtos/register-review";
import {
  InvalidSatisfactionRateError,
  OrderNotFoundError,
  RegisterReviewError,
  type ReviewType,
  UserNotFoundError,
} from "@/domain/entities/review";
import { UnknownError } from "@/domain/entities/user";
import { OrderRepo } from "@/domain/repositories/order-repo";
import { ReviewRepo } from "@/domain/repositories/review-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function registerReviewUseCase(
  data: z.infer<typeof RegisterReviewDto>,
): Promise<Result<ReviewType, RegisterReviewError>> {
  try {
    const reviewRepo = new ReviewRepo(DB);
    const userRepo = new UserRepo(DB);
    const orderRepo = new OrderRepo(DB);

    if (data.satisfactionRate < 0 || data.satisfactionRate > 5) {
      return Err(new InvalidSatisfactionRateError(data.satisfactionRate));
    }

    const userExists = await userRepo.findById(data.userId);
    if (!userExists) return Err(new UserNotFoundError(data.userId));

    const orderExists = await orderRepo.findById(data.orderId);
    if (!orderExists) return Err(new OrderNotFoundError(data.orderId));

    if (orderExists.userId !== data.userId) {
      return Err(new OrderNotFoundError(data.orderId));
    }

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
