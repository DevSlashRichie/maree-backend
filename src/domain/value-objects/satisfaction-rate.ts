import { InvalidSatisfactionRateError } from "@/domain/entities/review";

export type SatisfactionRate = number & { readonly brand: unique symbol };

export function createSatisfactionRate(rate: number): SatisfactionRate {
  if (!Number.isInteger(rate) || rate < 0 || rate > 5) {
    throw new InvalidSatisfactionRateError(rate);
  }
  return rate as SatisfactionRate;
}
