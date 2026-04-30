import { describe, expect, it } from "bun:test";
import { UpdateUserDto } from "@/application/dtos/user";

describe("UpdateUserDto (DTO)", () => {
  it("should parse valid update data with firstName", () => {
    const data = { firstName: "John" };
    const parsed = UpdateUserDto.parse(data);
    expect(parsed.firstName).toBe("John");
  });

  it("should parse valid update data with lastName", () => {
    const data = { lastName: "Doe" };
    const parsed = UpdateUserDto.parse(data);
    expect(parsed.lastName).toBe("Doe");
  });

  it("should parse valid update data with multiple fields", () => {
    const data = { firstName: "John", lastName: "Doe" };
    const parsed = UpdateUserDto.parse(data);
    expect(parsed.firstName).toBe("John");
    expect(parsed.lastName).toBe("Doe");
  });

  it("should parse empty object", () => {
    const data = {};
    const parsed = UpdateUserDto.parse(data);
    expect(parsed.firstName).toBeUndefined();
    expect(parsed.lastName).toBeUndefined();
  });
});
