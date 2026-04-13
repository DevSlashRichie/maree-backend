import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  createCoupon,
  InvalidCouponCodeError,
  InvalidCouponMaxUsesError,
} from "@/domain/value-objects/coupon";
import { discountsTable } from "@/infrastructure/db/schema";

export type Discount = InferSelectModel<typeof discountsTable>;

export const DiscountSchema = createSelectSchema(discountsTable);
export type DiscountType = z.infer<typeof DiscountSchema>;

export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type DiscountTypeEnum = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_STATES = ["active", "inactive"] as const;
export type DiscountState = (typeof DISCOUNT_STATES)[number];

export const DiscountStateSchema = z.enum(DISCOUNT_STATES);
export type DiscountStateSchema = z.infer<typeof DiscountStateSchema>;

export const DiscountTypeSchema = z.enum(DISCOUNT_TYPES);
export type DiscountTypeSchema = z.infer<typeof DiscountTypeSchema>;

export const DEFAULT_DISCOUNT_STATE: DiscountState = "active";
export const DEFAULT_COUPON_MAX_USES = 1;
export const DEFAULT_HIDDEN = false;

export function generateCouponCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export function getDefaultDiscountDates(): {
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  return { startDate, endDate };
}

export abstract class DiscountDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateDiscountParams {
  name: string;
  type: string;
  value: bigint;
  appliesTo: string[];
  state: string;
  startDate: Date;
  endDate: Date;
  code?: string;
  maxUses?: number;
  hidden?: boolean;
}

export function createDiscount(params: CreateDiscountParams) {
  const parsedName = z.string().min(1).parse(params.name);

  if (!DISCOUNT_TYPES.includes(params.type as DiscountTypeEnum)) {
    throw new InvalidDiscountTypeError(params.type);
  }
  const parsedType = params.type;

  if (params.value <= 0n) {
    throw new InvalidDiscountValueError(params.value);
  }
  const parsedValue = params.value;

  const parsedAppliesTo = z.array(z.string()).min(0).parse(params.appliesTo);

  if (!DISCOUNT_STATES.includes(params.state as DiscountState)) {
    throw new InvalidDiscountStateError(params.state);
  }
  const parsedState = z.enum(["active", "inactive"]).parse(params.state);

  const parsedStartDate = z.date().parse(params.startDate);
  const parsedEndDate = z.date().parse(params.endDate);

  if (parsedEndDate <= parsedStartDate) {
    throw new InvalidDiscountDatesError();
  }

  let parsedCode: string | undefined;
  let parsedMaxUses: number | undefined;

  if (params.code !== undefined) {
    const coupon = createCoupon(params.code, params.maxUses);
    parsedCode = coupon.code;
    parsedMaxUses = coupon.maxUses ?? undefined;
  }

  const parsedHidden = params.hidden ?? DEFAULT_HIDDEN;

  return {
    name: parsedName,
    type: parsedType,
    value: parsedValue,
    appliesTo: parsedAppliesTo,
    state: parsedState,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    code: parsedCode,
    maxUses: parsedMaxUses,
    hidden: parsedHidden,
  };
}

export class InvalidDiscountTypeError extends DiscountDomainError {
  readonly code = "INVALID_DISCOUNT_TYPE";

  constructor(type: string) {
    super(
      `Discount type '${type}' is invalid. Must be one of: ${DISCOUNT_TYPES.join(", ")}`,
    );
    this.name = "InvalidDiscountTypeError";
  }
}

export class InvalidDiscountValueError extends DiscountDomainError {
  readonly code = "INVALID_DISCOUNT_VALUE";

  constructor(value: bigint) {
    super(`Discount value ${value} must be greater than 0.`);
    this.name = "InvalidDiscountValueError";
  }
}

export class InvalidDiscountStateError extends DiscountDomainError {
  readonly code = "INVALID_DISCOUNT_STATE";

  constructor(state: string) {
    super(
      `Discount state '${state}' is invalid. Must be one of: ${DISCOUNT_STATES.join(", ")}`,
    );
    this.name = "InvalidDiscountStateError";
  }
}

export class InvalidDiscountDatesError extends DiscountDomainError {
  readonly code = "INVALID_DISCOUNT_DATES";

  constructor() {
    super("End date must be after start date.");
    this.name = "InvalidDiscountDatesError";
  }
}

export { InvalidCouponCodeError, InvalidCouponMaxUsesError };