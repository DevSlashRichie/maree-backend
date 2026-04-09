import { describe, expect, it } from "bun:test";
import { createBranch } from "@/domain/entities/branch";

describe("createBranch", () => {
  it("should create branch with valid params", () => {
    const branch = createBranch({
      name: "Downtown",
      state: "active",
    });
    expect(branch.name).toBe("Downtown");
    expect(branch.state).toBe("active");
  });

  it("should create branch with valid params and set it to inactive", () => {
    const branch = createBranch({
      name: "Uptown",
      state: "inactive",
    });
    expect(branch.name).toBe("Uptown");
    expect(branch.state).toBe("inactive");
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

  it("should throw for invalid state", () => {
    expect(() =>
      createBranch({
        name: "Downtown",
        state: "idk",
      }),
    ).toThrow();
  });

  it("should allow whitespace in name", () => {
    const branch = createBranch({
      name: "   ",
      state: "active",
    });
    expect(branch.name).toBe("   ");
  });
});
