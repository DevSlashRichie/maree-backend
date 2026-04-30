import { describe, expect, it } from "bun:test";
import { AlreadyExistsBranch } from "@/application/errors/create-branch";

describe("Branch Errors", () => {
  describe("AlreadyExistsBranch", () => {
    it("should have correct code", () => {
      const error = new AlreadyExistsBranch();
      expect(error.code).toBe("branch_already_exists");
    });

    it("should have correct message", () => {
      const error = new AlreadyExistsBranch();
      expect(error.message).toBe("Branch already exists");
    });

    it("should be instanceof Error", () => {
      const error = new AlreadyExistsBranch();
      expect(error).toBeInstanceOf(Error);
    });
  });
});
