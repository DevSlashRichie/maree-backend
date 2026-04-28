import { Err, Ok, type Result } from "oxide.ts";
import type { CreateAllowedIngredientDto } from "@/application/dtos/product-allowed-ingredient";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function createAllowedIngredientUseCase(
  data: CreateAllowedIngredientDto,
  // biome-ignore lint/suspicious/noExplicitAny: drizzle inferred return type
): Promise<Result<any, Error>> {
  try {
    return await DB.transaction(async (txn) => {
      const productRepo = new ProductRepo(txn);

      // Validate variant exists
      const variant = await productRepo.findProductVariant(
        data.productVariantId,
      );
      if (!variant) {
        return Err(new Error("Variant not found"));
      }

      // Validate allowed product exists and is an ingredient if provided
      if (data.allowedProductId) {
        const isIngredient = await productRepo.isIngredientFromType(
          data.allowedProductId,
        );
        if (!isIngredient) {
          return Err(new Error("Allowed product must be an ingredient"));
        }
      }

      // Validate category exists if provided
      if (data.allowedCategoryId) {
        const category = await productRepo.findCategoryById(
          data.allowedCategoryId,
        );
        if (!category) {
          return Err(new Error("Category not found"));
        }
      }

      const result = await productRepo.saveAllowedIngredient({
        productVariantId: data.productVariantId,
        allowedProductId: data.allowedProductId,
        allowedCategoryId: null,
      });
      return Ok(result);
    });
  } catch (error) {
    return Err(error instanceof Error ? error : new Error("Unknown error"));
  }
}
