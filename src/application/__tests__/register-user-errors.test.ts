import { describe, expect, it } from "bun:test";
import {
  PasswordIsRequired,
  UserAlreadyExistsError,
} from "@/application/errors/register-user";

describe("Register User Errors", () => {
  describe("PasswordIsRequired", () => {
    it("should have correct code", () => {
      const error = new PasswordIsRequired();
      expect(error.code).toBe("password_is_required");
    });

    it("should have correct message", () => {
      const error = new PasswordIsRequired();
      expect(error.message).toBe("Password is required");
    });

    it("should be instanceof Error", () => {
      const error = new PasswordIsRequired();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("UserAlreadyExistsError", () => {
    it("should have correct code", () => {
      const error = new UserAlreadyExistsError();
      expect(error.code).toBe("user_already_exists");
    });

    it("should have correct message", () => {
      const error = new UserAlreadyExistsError();
      expect(error.message).toBe("User already exists");
    });
  });
});
