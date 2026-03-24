import { describe, expect, it } from "bun:test";
import { InvalidSatisfactionRateError } from "@/domain/entities/review";
import {
  createSatisfactionRate,
  type SatisfactionRate,
} from "@/domain/value-objects/satisfaction-rate";

describe("SatisfactionRate", () => {
  it("should create a valid satisfaction rate of 0", () => {
    const rate = createSatisfactionRate(0);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(0);
  });

  it("should create a valid satisfaction rate of 1", () => {
    const rate = createSatisfactionRate(1);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(1);
  });

  it("should create a valid satisfaction rate of 2", () => {
    const rate = createSatisfactionRate(2);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(2);
  });

  it("should create a valid satisfaction rate of 3", () => {
    const rate = createSatisfactionRate(3);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(3);
  });

  it("should create a valid satisfaction rate of 4", () => {
    const rate = createSatisfactionRate(4);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(4);
  });

  it("should create a valid satisfaction rate of 5", () => {
    const rate = createSatisfactionRate(5);
    expect(rate).toBeDefined();
    expect(Number(rate)).toBe(5);
  });

  it("should throw for negative number", () => {
    expect(() => createSatisfactionRate(-1)).toThrow(
      InvalidSatisfactionRateError,
    );
  });

  it("should throw for number greater than 5", () => {
    expect(() => createSatisfactionRate(6)).toThrow(
      InvalidSatisfactionRateError,
    );
  });

  it("should throw for decimal number", () => {
    expect(() => createSatisfactionRate(3.5)).toThrow(
      InvalidSatisfactionRateError,
    );
  });

  it("should throw for non-integer number", () => {
    expect(() => createSatisfactionRate(4.5 as unknown as number)).toThrow();
  });

  it("should throw for null", () => {
    expect(() => createSatisfactionRate(null as unknown as number)).toThrow();
  });

  it("should throw for undefined", () => {
    expect(() =>
      createSatisfactionRate(undefined as unknown as number),
    ).toThrow();
  });
});
