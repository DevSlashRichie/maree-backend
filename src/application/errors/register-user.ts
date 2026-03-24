import { ApplicationError } from "@/application/error";

export abstract class RegisterUserError extends ApplicationError {
  abstract override readonly code: string;
}

export class UserAlreadyExistsError extends RegisterUserError {
  readonly code = "user_already_exists";

  constructor() {
    super("User already exists");
  }
}

export class PasswordIsRequired extends RegisterUserError {
  readonly code = "password_is_required";

  constructor() {
    super("Password is required");
  }
}
