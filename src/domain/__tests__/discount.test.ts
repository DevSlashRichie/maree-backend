import { describe, expect, it } from "bun:test";
import {
  createDiscount,
  InvalidCouponCodeError,
  InvalidCouponMaxUsesError,
  InvalidDiscountDatesError,
  InvalidDiscountStateError,
  InvalidDiscountTypeError,
  InvalidDiscountValueError,
} from "@/domain/entities/discount";

const validParams = {
  name: "Summer Sale",
  type: "percentage",
  value: 20n,
  appliesTo: ["coffee"],
  state: "active",
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
};

describe("createDiscount", () => {
  it("should create discount with valid params", () => {
    const discount = createDiscount(validParams);
    expect(discount.name).toBe("Summer Sale");
    expect(discount.type).toBe("percentage");
    expect(discount.value).toBe(20n);
    expect(discount.appliesTo).toEqual(["coffee"]);
    expect(discount.state).toBe("active");
  });

  it("should create discount with coupon", () => {
    const discount = createDiscount({
      ...validParams,
      code: "SUMMER20",
      maxUses: 100,
    });
    expect(discount.code).toBe("SUMMER20");
    expect(discount.maxUses).toBe(100);
  });

  it("should throw for empty name", () => {
    expect(() => createDiscount({ ...validParams, name: "" })).toThrow();
  });

  it("should throw for invalid type", () => {
    expect(() => createDiscount({ ...validParams, type: "invalid" })).toThrow(
      InvalidDiscountTypeError,
    );
  });

  it("should throw for zero value", () => {
    expect(() => createDiscount({ ...validParams, value: 0n })).toThrow(
      InvalidDiscountValueError,
    );
  });

  it("should throw for negative value", () => {
    expect(() => createDiscount({ ...validParams, value: -10n })).toThrow(
      InvalidDiscountValueError,
    );
  });

  it("should throw for empty appliesTo", () => {
    expect(() => createDiscount({ ...validParams, appliesTo: [] })).toThrow();
  });

  it("should throw for invalid state", () => {
    expect(() => createDiscount({ ...validParams, state: "invalid" })).toThrow(
      InvalidDiscountStateError,
    );
  });

  it("should throw when endDate before startDate", () => {
    expect(() =>
      createDiscount({
        ...validParams,
        startDate: new Date("2025-12-31"),
        endDate: new Date("2025-01-01"),
      }),
    ).toThrow(InvalidDiscountDatesError);
  });

  it("should throw for invalid coupon code", () => {
    expect(() =>
      createDiscount({
        ...validParams,
        code: "abc",
      }),
    ).toThrow(InvalidCouponCodeError);
  });

  it("should throw for zero maxUses", () => {
    expect(() =>
      createDiscount({
        ...validParams,
        code: "SAVE20",
        maxUses: 0,
      }),
    ).toThrow(InvalidCouponMaxUsesError);
  });
});
