import { describe, expect, it } from "bun:test";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/application/errors/rbac";

describe("RBAC Errors", () => {
  describe("ForbiddenError", () => {
    it("should have correct code", () => {
      const error = new ForbiddenError();
      expect(error.code).toBe("forbidden");
    });

    it("should have correct message", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe("Admin access required");
    });
  });

  describe("RoleNotFoundError", () => {
    it("should have correct code", () => {
      const error = new RoleNotFoundError();
      expect(error.code).toBe("role_not_found");
    });

    it("should have correct message", () => {
      const error = new RoleNotFoundError();
      expect(error.message).toBe("Role not found");
    });
  });

  describe("UserNotFoundError", () => {
    it("should have correct code", () => {
      const error = new UserNotFoundError();
      expect(error.code).toBe("user_not_found");
    });

    it("should have correct message", () => {
      const error = new UserNotFoundError();
      expect(error.message).toBe("User not found");
    });
  });
});
