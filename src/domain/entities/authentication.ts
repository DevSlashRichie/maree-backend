export abstract class UserError extends Error {
  abstract readonly code: string;
}

export class InvalidCredentialsError extends UserError {
  readonly code = "invalid_credentials";

  constructor() {
    super("Invalid credentials");
  }
}

export class NotImplementedLoginMethodError extends UserError {
  readonly code = "not_implemented";

  constructor() {
    super("Login method not implemented");
  }
}

export class UserNotFoundError extends UserError {
  override readonly code = "user_not_found";

  constructor() {
    super("User not found");
  }
}

export class RepositoryError extends UserError {
  readonly code = "repository_error";

  constructor(message: string) {
    super(`Repository error: ${message}`);
  }
}
