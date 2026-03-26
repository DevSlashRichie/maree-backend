export abstract class AuthenticationError extends Error {
  abstract readonly code: string;
}
