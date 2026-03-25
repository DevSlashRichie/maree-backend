import { describe, expect, it } from "bun:test";
import {
  createCoupon,
  createCouponCode,
  InvalidCouponCodeError,
  InvalidCouponMaxUsesError,
} from "@/domain/value-objects/coupon";

describe("createCouponCode", () => {
  it("should return undefined for undefined input", () => {
    const result = createCouponCode(undefined);
    expect(result).toBeUndefined();
  });

  it("should create valid coupon code", () => {
    const result = createCouponCode("SAVE20");
    expect(result).toEqual({ code: "SAVE20", maxUses: null });
  });

  it("should throw for lowercase code", () => {
    expect(() => createCouponCode("save20")).toThrow(InvalidCouponCodeError);
  });

  it("should throw for code shorter than 4 chars", () => {
    expect(() => createCouponCode("ABC")).toThrow(InvalidCouponCodeError);
  });

  it("should throw for code longer than 20 chars", () => {
    expect(() => createCouponCode("A".repeat(21))).toThrow(
      InvalidCouponCodeError,
    );
  });

  it("should throw for code with special characters", () => {
    expect(() => createCouponCode("SAVE-20")).toThrow(InvalidCouponCodeError);
  });

  it("should throw for code with lowercase", () => {
    expect(() => createCouponCode("save20")).toThrow();
  });
});

describe("createCoupon", () => {
  it("should create coupon with valid code", () => {
    const coupon = createCoupon("SAVE20", undefined);
    expect(coupon.code).toBe("SAVE20");
    expect(coupon.maxUses).toBeNull();
  });

  it("should create coupon with maxUses", () => {
    const coupon = createCoupon("SAVE20", 100);
    expect(coupon.code).toBe("SAVE20");
    expect(coupon.maxUses).toBe(100);
  });

  it("should throw for invalid code", () => {
    expect(() => createCoupon("abc", undefined)).toThrow(
      InvalidCouponCodeError,
    );
  });

  it("should throw for zero maxUses", () => {
    expect(() => createCoupon("SAVE20", 0)).toThrow(InvalidCouponMaxUsesError);
  });

  it("should throw for negative maxUses", () => {
    expect(() => createCoupon("SAVE20", -1)).toThrow(InvalidCouponMaxUsesError);
  });
});
