import { describe, expect, it } from "bun:test";
import { ActorNotFoundError } from "@/application/errors/get-actor";

describe("GetActor Errors", () => {
  describe("ActorNotFoundError", () => {
    it("should have correct code", () => {
      const error = new ActorNotFoundError();
      expect(error.code).toBe("actor_not_found");
    });

    it("should have correct message", () => {
      const error = new ActorNotFoundError();
      expect(error.message).toBe("Actor not found");
    });

    it("should be instanceof Error", () => {
      const error = new ActorNotFoundError();
      expect(error).toBeInstanceOf(Error);
    });
  });
});
