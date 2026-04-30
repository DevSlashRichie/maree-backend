import { describe, expect, it } from "bun:test";
import {
  InvalidCredentialsError,
  NotImplementedLoginMethodError,
  RepositoryError,
} from "@/application/errors/login-user";

describe("Login Errors", () => {
  describe("InvalidCredentialsError", () => {
    it("should have correct code", () => {
      const error = new InvalidCredentialsError();
      expect(error.code).toBe("invalid_credentials");
    });

    it("should have correct message", () => {
      const error = new InvalidCredentialsError();
      expect(error.message).toBe("Invalid credentials");
    });

    it("should be instanceof Error", () => {
      const error = new InvalidCredentialsError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NotImplementedLoginMethodError", () => {
    it("should have correct code", () => {
      const error = new NotImplementedLoginMethodError();
      expect(error.code).toBe("not_implemented");
    });

    it("should have correct message", () => {
      const error = new NotImplementedLoginMethodError();
      expect(error.message).toBe("Login method not implemented");
    });
  });

  describe("RepositoryError", () => {
    it("should have correct code", () => {
      const error = new RepositoryError("Database connection failed");
      expect(error.code).toBe("repository_error");
    });

    it("should include custom message", () => {
      const error = new RepositoryError("Custom error message");
      expect(error.message).toBe("Repository error: Custom error message");
    });
  });
});
