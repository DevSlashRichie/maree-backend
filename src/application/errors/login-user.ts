import { ApplicationError } from "@/application/error";

export abstract class LoginError extends ApplicationError {
  abstract override readonly code: string;
}

export class InvalidCredentialsError extends LoginError {
  readonly code = "invalid_credentials";

  constructor() {
    super("Invalid credentials");
  }
}

export class NotImplementedLoginMethodError extends LoginError {
  readonly code = "not_implemented";

  constructor() {
    super("Login method not implemented");
  }
}

export class RepositoryError extends LoginError {
  readonly code = "repository_error";

  constructor(message: string) {
    super(`Repository error: ${message}`);
  }
}
