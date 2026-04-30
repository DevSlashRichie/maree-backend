import { describe, expect, it } from "bun:test";
import { CreateProductDto } from "@/application/dtos/create-product";

describe("CreateProductDto (DTO)", () => {
  it("should reject invalid categoryId", () => {
    const productData = {
      name: "Test",
      status: "active",
      categoryId: "invalid-uuid",
      type: "complete",
    };
    expect(() => CreateProductDto.parse(productData)).toThrow();
  });

  it("should reject invalid status", () => {
    const productData = {
      name: "Test",
      status: "invalid",
      categoryId: "019dd618-1c11-7000-0000-000000000001",
      type: "complete",
    };
    expect(() => CreateProductDto.parse(productData)).toThrow();
  });

  it("should reject empty name", () => {
    const productData = {
      name: "",
      status: "active",
      categoryId: "019dd618-1c11-7000-0000-000000000001",
      type: "complete",
    };
    expect(() => CreateProductDto.parse(productData)).toThrow();
  });

  it("should reject invalid type", () => {
    const productData = {
      name: "Test",
      status: "active",
      categoryId: "019dd618-1c11-7000-0000-000000000001",
      type: "invalid",
    };
    expect(() => CreateProductDto.parse(productData)).toThrow();
  });

  it("should reject missing required fields", () => {
    const productData = {
      name: "Test",
    };
    expect(() => CreateProductDto.parse(productData)).toThrow();
  });
});
