import { Err, Ok, type Result } from "oxide.ts";
import type { CreateCategoryDto } from "@/application/dtos/create-category";
import { UnknownError } from "@/application/error";
import {
  CategoryAlreadyExistsError,
  type CategoryError,
  ParentCategoryNotFoundError,
} from "@/application/errors/category";
import type { Category } from "@/domain/entities/category";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function createCategoryUseCase(
  data: CreateCategoryDto,
): Promise<Result<Category, CategoryError | UnknownError>> {
  try {
    const productRepo = new ProductRepo(DB);

    const existingCategory = await productRepo.findCategoryByName(data.name);
    if (existingCategory) {
      return Err(new CategoryAlreadyExistsError());
    }

    if (data.parentId) {
      const parentCategory = await productRepo.findCategoryById(data.parentId);
      if (!parentCategory) {
        return Err(new ParentCategoryNotFoundError());
      }
    }

    const category = await productRepo.saveCategory(data);
    return Ok(category);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
