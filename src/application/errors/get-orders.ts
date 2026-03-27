import { ApplicationError } from "@/application/error.ts";

export abstract class GetOrdersError extends ApplicationError {
  abstract override readonly code: string;
}

export class UnknownError extends GetOrdersError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
