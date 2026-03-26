import { ZodError } from "zod";

export interface DomainError extends Error {
  readonly code: string;
}

export function isKnownError(error: unknown): error is DomainError {
  return (
    error instanceof ZodError ||
    (error instanceof Error &&
      "code" in error &&
      typeof (error as DomainError).code === "string")
  );
}
