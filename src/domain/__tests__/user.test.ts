import { describe, expect, it } from "bun:test";
import {
  createUser,
  InvalidEmailError,
  InvalidPhoneError,
} from "@/domain/entities/user";

describe("createUser", () => {
  it("should create user with valid params", () => {
    const user = createUser({
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
    });
    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Doe");
    expect(user.phone).toBe("+1234567890");
    expect(user.email).toBeUndefined();
  });

  it("should create user with email", () => {
    const user = createUser({
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      email: "john@example.com",
    });
    expect(user.email).toBe("john@example.com");
  });

  it("should throw for invalid phone", () => {
    expect(() =>
      createUser({
        firstName: "John",
        lastName: "Doe",
        phone: "invalid",
      }),
    ).toThrow(InvalidPhoneError);
  });

  it("should throw for invalid email", () => {
    expect(() =>
      createUser({
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        email: "invalid-email",
      }),
    ).toThrow(InvalidEmailError);
  });

  it("should throw for empty firstName", () => {
    expect(() =>
      createUser({
        firstName: "",
        lastName: "Doe",
        phone: "+1234567890",
      }),
    ).toThrow();
  });

  it("should throw for empty lastName", () => {
    expect(() =>
      createUser({
        firstName: "John",
        lastName: "",
        phone: "+1234567890",
      }),
    ).toThrow();
  });
});
