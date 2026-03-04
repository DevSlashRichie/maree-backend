import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { userTable } from "@/infrastructure/db/schema";

export type User = InferSelectModel<typeof userTable>;

export const UserSchema = createSelectSchema(userTable);
export type UserType = z.infer<typeof UserSchema>;

export abstract class RegisterUserError extends Error {
  abstract readonly code: string;
}

export class UnknownError extends RegisterUserError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
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
