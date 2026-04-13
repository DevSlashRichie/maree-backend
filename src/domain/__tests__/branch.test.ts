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

  it("should throw for empty name", () => {
    expect(() =>
      createBranch({
        name: "",
        state: "active",
      }),
    ).toThrow();
  });

  it("should throw for invalid state", () => {
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
      state: "active",
    });
    expect(branch.name).toBe("   ");
  });

  it("should allow inactive branch", () => {
    const branch = createBranch({
      name: "name",
      state: "inactive",
    });

    expect(branch.state).toBe("inactive");
  });

  it("should allow active branch", () => {
    const branch = createBranch({
      name: "name",
      state: "active",
    });

    expect(branch.state).toBe("active");
  });
});
