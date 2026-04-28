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
  IncompatibleIngredientFlavor,
  IngredientsOnlyForCompleteProduct,
  InvalidIngredientQuantity,
} from "@/application/errors/create-product-variant.ts";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import {
  IncompatibleIngredientFlavorError,
  IngredientsOnlyForCompleteProductError,
} from "@/domain/value-objects/ingredient-composition";
import {
  createIngredientQuantity,
  InvalidIngredientQuantityError,
} from "@/domain/value-objects/ingredient-quantity";
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

      const type = (await productRepo.isIngredientFromCategory(data.categoryId))
        ? "ingredient"
        : "complete";

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
        description: data.description,
      });
      console.log("variant saved");

      if (data.ingredients?.length) {
        for (const ingredient of data.ingredients) {
          const _ingredientProduct = await productRepo.findProductVariant(
            ingredient.id,
          );

          if (!_ingredientProduct?.length) {
            throw new AddedProductDoesNotExist(ingredient.id);
          }

          const [ingredientProduct] = _ingredientProduct;

          if (!ingredientProduct) {
            throw new AddedProductDoesNotExist(ingredient.id);
          }

          if (ingredientProduct.product.type !== "ingredient") {
            throw new AddedProductIsNotIngredient();
          }
        }

        const componentsData = data.ingredients.map(
          ({ id, quantity, isRemovable }) => ({
            productVariantId: productVariant.id,
            productId: id,
            quantity: createIngredientQuantity(quantity),
            isRemovable,
          }),
        );
        await productRepo.saveProductComponents(componentsData);
      }

      if (data.allowedIngredients?.length) {
        for (const ingredientId of data.allowedIngredients) {
          await productRepo.saveAllowedIngredient({
            productVariantId: productVariant.id,
            allowedProductId: ingredientId,
            allowedCategoryId: null,
          });
        }
      }

      if (data.allowedCategories?.length) {
        for (const categoryId of data.allowedCategories) {
          await productRepo.saveAllowedIngredient({
            productVariantId: productVariant.id,
            allowedProductId: null,
            allowedCategoryId: categoryId,
          });
        }
      }

      return Ok({
        product,
        variant: productVariant,
      });
    });
  } catch (error) {
    if (error instanceof IngredientsOnlyForCompleteProductError) {
      return Err(new IngredientsOnlyForCompleteProduct());
    }

    if (error instanceof IncompatibleIngredientFlavorError) {
      return Err(new IncompatibleIngredientFlavor());
    }

    if (error instanceof InvalidIngredientQuantityError) {
      return Err(new InvalidIngredientQuantity());
    }

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
