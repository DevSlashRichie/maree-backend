import { ApplicationError } from "@/application/error";

export abstract class RbacError extends ApplicationError {
  abstract override readonly code: string;
}

export class ForbiddenError extends RbacError {
  readonly code = "forbidden";

  constructor() {
    super("Admin access required");
  }
}

export class RoleNotFoundError extends RbacError {
  readonly code = "role_not_found";

  constructor() {
    super("Role not found");
  }
}

export class UserNotFoundError extends RbacError {
  readonly code = "user_not_found";

  constructor() {
    super("User not found");
  }
}
