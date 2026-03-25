import { describe, expect, it } from "bun:test";
import {
  createProductStatus,
  InvalidProductStatusError,
  PRODUCT_STATUSES,
} from "@/domain/value-objects/product-status";

describe("ProductStatus", () => {
  it("should create valid status 'active'", () => {
    const status = createProductStatus("active");
    expect(status).toBe("active");
  });

  it("should create valid status 'inactive'", () => {
    const status = createProductStatus("inactive");
    expect(status).toBe("inactive");
  });

  it("should throw for invalid status", () => {
    expect(() => createProductStatus("invalid")).toThrow(
      InvalidProductStatusError,
    );
  });

  it("should throw for empty string", () => {
    expect(() => createProductStatus("")).toThrow(InvalidProductStatusError);
  });

  it("should throw for unknown status", () => {
    expect(() => createProductStatus("deleted")).toThrow(
      InvalidProductStatusError,
    );
  });

  it("should have correct PRODUCT_STATUSES constant", () => {
    expect(PRODUCT_STATUSES).toEqual(["active", "inactive"]);
  });
});
