import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userTable } from "@/infrastructure/db/schema";

export type User = InferSelectModel<typeof userTable>;

export const UserSchema = createSelectSchema(userTable);
export type UserType = z.infer<typeof UserSchema>;

export abstract class UserDomainError extends Error {
  abstract readonly code: string;
}

export class InvalidPhoneError extends UserDomainError {
  readonly code = "INVALID_PHONE";

  constructor(phone: string) {
    super(`Phone number '${phone}' is invalid.`);
    this.name = "InvalidPhoneError";
  }
}

export class InvalidEmailError extends UserDomainError {
  readonly code = "INVALID_EMAIL";

  constructor(email: string) {
    super(`Email '${email}' is invalid.`);
    this.name = "InvalidEmailError";
  }
}

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export function createUser(params: CreateUserParams) {
  const parsedFirstName = z.string().min(1).parse(params.firstName);
  const parsedLastName = z.string().min(1).parse(params.lastName);

  if (!phoneRegex.test(params.phone)) {
    throw new InvalidPhoneError(params.phone);
  }
  const parsedPhone = params.phone;

  let parsedEmail: string | undefined;
  if (params.email !== undefined) {
    if (!emailRegex.test(params.email)) {
      throw new InvalidEmailError(params.email);
    }
    parsedEmail = params.email;
  }

  return {
    firstName: parsedFirstName,
    lastName: parsedLastName,
    phone: parsedPhone,
    email: parsedEmail,
  };
}
