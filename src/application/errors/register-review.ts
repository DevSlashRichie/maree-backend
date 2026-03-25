export abstract class RegisterReviewError extends Error {
  abstract readonly code: string;
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
