import { describe, expect, it } from "bun:test";
import { createBranch } from "@/domain/entities/branch";

describe("createBranch", () => {
  it("should create branch with valid params", () => {
    const branch = createBranch({
      name: "Downtown",
      state: "CA",
    });
    expect(branch.name).toBe("Downtown");
    expect(branch.state).toBe("CA");
  });

  it("should throw for empty name", () => {
    expect(() =>
      createBranch({
        name: "",
        state: "CA",
      }),
    ).toThrow();
  });

  it("should throw for empty state", () => {
    expect(() =>
      createBranch({
        name: "Downtown",
        state: "",
      }),
    ).toThrow();
  });

  it("should allow whitespace in name", () => {
    const branch = createBranch({
      name: "   ",
      state: "CA",
    });
    expect(branch.name).toBe("   ");
  });
});
