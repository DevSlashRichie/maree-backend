import { describe, expect, it } from "bun:test";
import {
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
  ParentCategoryNotFoundError,
} from "@/application/errors/category";

describe("Category Errors", () => {
  describe("CategoryAlreadyExistsError", () => {
    it("should have correct code", () => {
      const error = new CategoryAlreadyExistsError();
      expect(error.code).toBe("category_already_exists");
    });

    it("should have correct message", () => {
      const error = new CategoryAlreadyExistsError();
      expect(error.message).toBe("Category already exists");
    });
  });

  describe("ParentCategoryNotFoundError", () => {
    it("should have correct code", () => {
      const error = new ParentCategoryNotFoundError();
      expect(error.code).toBe("parent_category_not_found");
    });

    it("should have correct message", () => {
      const error = new ParentCategoryNotFoundError();
      expect(error.message).toBe("Parent category not found");
    });
  });

  describe("CategoryNotFoundError", () => {
    it("should have correct code", () => {
      const error = new CategoryNotFoundError();
      expect(error.code).toBe("category_not_found");
    });

    it("should have correct message", () => {
      const error = new CategoryNotFoundError();
      expect(error.message).toBe("Category not found");
    });
  });
});
