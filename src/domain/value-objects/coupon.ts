export interface CouponCode {
  code: string;
  maxUses: number | null;
}

const couponCodeRegex = /^[A-Z0-9]{4,20}$/;

export function createCouponCode(
  code: string | undefined,
): CouponCode | undefined {
  if (code === undefined) {
    return undefined;
  }

  if (!couponCodeRegex.test(code)) {
    throw new InvalidCouponCodeError(code);
  }

  return {
    code: code.toUpperCase(),
    maxUses: null,
  };
}

export function createCoupon(
  code: string,
  maxUses: number | undefined,
): CouponCode {
  if (!couponCodeRegex.test(code)) {
    throw new InvalidCouponCodeError(code);
  }

  if (maxUses !== undefined && maxUses <= 0) {
    throw new InvalidCouponMaxUsesError(maxUses);
  }

  return {
    code: code.toUpperCase(),
    maxUses: maxUses ?? null,
  };
}

export class InvalidCouponCodeError extends Error {
  readonly code = "INVALID_COUPON_CODE";

  constructor(code: string) {
    super(
      `Coupon code '${code}' is invalid. Must be 4-20 alphanumeric uppercase characters.`,
    );
    this.name = "InvalidCouponCodeError";
  }
}

export class InvalidCouponMaxUsesError extends Error {
  readonly code = "INVALID_COUPON_MAX_USES";

  constructor(maxUses: number) {
    super(`Coupon maxUses ${maxUses} must be greater than 0.`);
    this.name = "InvalidCouponMaxUsesError";
  }
}
