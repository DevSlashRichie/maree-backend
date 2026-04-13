import { Ok, type Result } from "oxide.ts";
import type { z } from "zod";
import type { CreateCategoryDto } from "@/application/dtos/create-category.ts";
import { UnknownError } from "@/application/error.ts";
import {
  CategoryAlreadyExists,
  type CreateCategoryError,
} from "@/application/errors/create-category.ts";
import type { Category } from "@/domain/entities/category.ts";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function createCategoryUseCase(
  data: z.infer<typeof CreateCategoryDto>,
): Result<Category, CreateCategoryError> {
  try {
    return await DB.transaction(async (txn) => {
      const productRepo = new ProductRepo(txn);

      const categoryAlreadyExists = await productRepo.existsCategoryByName(
        data.name,
      );
      if (categoryAlreadyExists) {
        throw new CategoryAlreadyExists();
      }

      const category = await productRepo.saveCategory({
        name: data.name,
        description: data.description,
        parentId: data.parentId ?? null,
      });

      return Ok(category);
    });
  } catch (error) {
    if (error instanceof CategoryAlreadyExists) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
