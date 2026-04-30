import { describe, expect, it } from "bun:test";
import { LoginSchema } from "@/application/dtos/authentication";

describe("LoginSchema (DTO)", () => {
  it("should parse valid login with google method", () => {
    const loginData = {
      method: { type: "google", value: "some-id-token" },
    };
    const parsed = LoginSchema.parse(loginData);
    expect(parsed.method.type).toBe("google");
  });

  it("should parse valid login with test method", () => {
    const loginData = {
      identity: "test@example.com",
      method: { type: "test" },
    };
    const parsed = LoginSchema.parse(loginData);
    expect(parsed.method.type).toBe("test");
  });

  it("should reject invalid method type", () => {
    const loginData = {
      method: { type: "invalid", value: "test" } as any,
    };
    expect(() => LoginSchema.parse(loginData)).toThrow();
  });

  it("should reject code with invalid length", () => {
    const loginData = {
      identity: "+1234567890",
      method: { type: "code", value: "123" },
    };
    expect(() => LoginSchema.parse(loginData)).toThrow();
  });
});
