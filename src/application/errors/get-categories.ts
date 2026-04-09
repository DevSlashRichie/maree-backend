import { ApplicationError } from "@/application/error.ts";

export abstract class GetCategoriesError extends ApplicationError {
  abstract override readonly code: string;
}

export class NoCategoriesFound extends GetCategoriesError {
  readonly code = "no_categories_found";

  constructor() {
    super("No categories found");
  }
}

export class UnknownError extends GetCategoriesError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
