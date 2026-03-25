export abstract class ApplicationError extends Error {
  abstract readonly code: string;
}

export class UnknownError extends ApplicationError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}
