export interface UseCaseError<T> {
  _errorType: T;
  type: T;
  message: string;
}

export function isDomainError(error: unknown): error is {
  _errorType: unknown;
  type: unknown;
  message: unknown;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "_errorType" in error &&
    "type" in error &&
    "message" in error
  );
}
