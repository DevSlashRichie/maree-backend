import { ApplicationError } from "@/application/error";

export abstract class CategoryError extends ApplicationError {}

export class CategoryNotFoundError extends CategoryError {
  readonly code = "category_not_found";

  constructor() {
    super("Category not found");
  }
}

export class ParentCategoryNotFoundError extends CategoryError {
  readonly code = "parent_category_not_found";

  constructor() {
    super("Parent category not found");
  }
}

export class CategoryAlreadyExistsError extends CategoryError {
  readonly code = "category_already_exists";

  constructor() {
    super("Category already exists");
  }
}

export class CategoryCycleDetectedError extends CategoryError {
  readonly code = "category_cycle_detected";

  constructor() {
    super("Cannot set category as its own parent");
  }
}
