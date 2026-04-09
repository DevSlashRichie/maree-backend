import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type {
  CreateProductAndVariantDto,
  CreateProductAndVariantResponseDto,
} from "@/application/dtos/create-product-and-variant.ts";
import { UnknownError } from "@/application/error.ts";
import {
  AddedProductDoesNotExist,
  AddedProductIsNotIngredient,
  CreateProductVariantError,
  ProductAlreadyExists,
  ProductVariantAlreadyExists,
} from "@/application/errors/create-product-variant.ts";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function createProductAndVariantUseCase(
  data: z.infer<typeof CreateProductAndVariantDto>,
): Promise<
  Result<
    z.infer<typeof CreateProductAndVariantResponseDto>,
    CreateProductVariantError
  >
> {
  try {
    return await DB.transaction(async (txn) => {
      const productRepo = new ProductRepo(txn);

      const productVariantAlreadyExists =
        await productRepo.existsProductVariant(data.name);
      if (productVariantAlreadyExists) {
        console.log("variant already exists");
        throw new ProductVariantAlreadyExists();
      }

      const productAlreadyExists = await productRepo.existsProduct(data.name);
      if (productAlreadyExists) {
        console.log("product already exists");
        throw new ProductAlreadyExists();
      }

      const type = (await productRepo.isIngredientFromCategory(data.categoryId))
        ? "ingredient"
        : "complete-product";

      const product = await productRepo.saveProduct({
        name: data.name,
        type: type,
        status: data.status,
        image: data.imageUrl,
        categoryId: data.categoryId,
      });
      console.log("product saved");

      const productVariant = await productRepo.saveProductVariant({
        name: data.name,
        price: BigInt(data.price),
        image: data.imageUrl,
        productId: product.id,
      });
      console.log("variant saved");

      if (data.ingredients?.length) {
        for (const ingredient of data.ingredients) {
          const ingredientExists = await productRepo.existsProductById(
            ingredient.id,
          );
          if (!ingredientExists) {
            throw new AddedProductDoesNotExist(ingredient.id);
          }

          const isIngredient = await productRepo.isIngredientFromType(
            ingredient.id,
          );
          if (!isIngredient) {
            throw new AddedProductIsNotIngredient();
          }
        }

        const componentsData = data.ingredients.map(
          ({ id, quantity, isRemovable }) => ({
            productVariantId: productVariant.id,
            productId: id,
            quantity,
            isRemovable,
          }),
        );
        await productRepo.saveProductComponents(componentsData);
      }

      return Ok({
        product,
        variant: productVariant,
      });
    });
  } catch (error) {
    if (error instanceof CreateProductVariantError) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  } finally {
  }
}
