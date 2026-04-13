import { ApplicationError } from "@/application/error.ts";

export abstract class CreateCategoryError extends ApplicationError {
  abstract override readonly code: string;
}

export class CategoryAlreadyExists extends CreateCategoryError {
  readonly code = "category_already_exists";

  constructor() {
    super("Category Already Exists");
  }
}

export class UnknownError extends CreateCategoryError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
