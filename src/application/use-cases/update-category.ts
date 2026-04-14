import { Err, Ok, type Result } from "oxide.ts";
import type { UpdateCategoryDto } from "@/application/dtos/update-category";
import { UnknownError } from "@/application/error";
import {
  CategoryCycleDetectedError,
  type CategoryError,
  CategoryNotFoundError,
  ParentCategoryNotFoundError,
} from "@/application/errors/category";
import type { Category } from "@/domain/entities/category";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function updateCategoryUseCase(
  id: string,
  data: UpdateCategoryDto,
): Promise<Result<Category, CategoryError | UnknownError>> {
  try {
    const productRepo = new ProductRepo(DB);

    const existingCategory = await productRepo.findCategoryById(id);
    if (!existingCategory) {
      return Err(new CategoryNotFoundError());
    }

    if (data.parentId) {
      if (data.parentId === id) {
        return Err(new CategoryCycleDetectedError());
      }

      const parentCategory = await productRepo.findCategoryById(data.parentId);
      if (!parentCategory) {
        return Err(new ParentCategoryNotFoundError());
      }
    }

    const category = await productRepo.updateCategory(id, data);
    if (!category) {
      return Err(new CategoryNotFoundError());
    }
    return Ok(category);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
