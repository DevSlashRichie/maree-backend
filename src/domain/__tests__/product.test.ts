import { describe, expect, it } from "bun:test";
import { createProduct } from "@/domain/entities/product";
import { InvalidProductStatusError } from "@/domain/value-objects/product-status";

const validParams = {
  name: "Coffee",
  status: "active",
  categoryId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
};

describe("createProduct", () => {
  it("should create product with valid params", () => {
    const product = createProduct(validParams);
    expect(product.name).toBe("Coffee");
    expect(product.status).toBe("active");
    expect(product.categoryId).toBe(validParams.categoryId);
  });

  it("should create product with inactive status", () => {
    const product = createProduct({ ...validParams, status: "inactive" });
    expect(product.status).toBe("inactive");
  });

  it("should create product with image", () => {
    const product = createProduct({
      ...validParams,
      image: "https://example.com/image.jpg",
    });
    expect(product.image).toBe("https://example.com/image.jpg");
  });

  it("should create product without image", () => {
    const product = createProduct(validParams);
    expect(product.image).toBeUndefined();
  });

  it("should throw for empty name", () => {
    expect(() => createProduct({ ...validParams, name: "" })).toThrow();
  });

  it("should throw for invalid status", () => {
    expect(() => createProduct({ ...validParams, status: "invalid" })).toThrow(
      InvalidProductStatusError,
    );
  });

  it("should throw for invalid categoryId", () => {
    expect(() =>
      createProduct({ ...validParams, categoryId: "invalid" }),
    ).toThrow();
  });

  it("should throw for invalid image URL", () => {
    expect(() =>
      createProduct({ ...validParams, image: "not-a-url" }),
    ).toThrow();
  });
});
