export abstract class GetReviewError extends Error {
  abstract readonly code: string;
}

export class ReviewNotFoundError extends GetReviewError {
  readonly code = "REVIEW_NOT_FOUND";

  constructor(orderId: string) {
    super(`Review for order ID ${orderId} was not found.`);
    this.name = "ReviewNotFoundError";
  }
}
