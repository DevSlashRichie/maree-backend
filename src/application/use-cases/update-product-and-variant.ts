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
  IncompatibleIngredientFlavor,
  IngredientsOnlyForCompleteProduct,
  InvalidIngredientQuantity,
  ProductVariantNotFound,
  type UpdateProductAndVariantError,
} from "@/application/errors/update-product.ts";
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

export async function updateProductAndVariantUseCase(
  variantId: string,
  data: z.infer<typeof CreateProductAndVariantDto>,
): Promise<
  Result<
    z.infer<typeof CreateProductAndVariantResponseDto>,
    UpdateProductAndVariantError
  >
> {
  try {
    return await DB.transaction(async (txn) => {
      const productRepo = new ProductRepo(txn);

      const existing =
        await productRepo.findProductVariantWithComponents(variantId);
      if (!existing) {
        throw new ProductVariantNotFound();
      }

      const type = (await productRepo.isIngredientFromCategory(data.categoryId))
        ? "ingredient"
        : "complete";

      const product = await productRepo.updateProduct(existing.product.id, {
        name: data.name,
        type,
        status: data.status,
        image: data.imageUrl,
        categoryId: data.categoryId,
      });

      const variant = await productRepo.updateProductVariant(variantId, {
        name: data.name,
        price: BigInt(data.price),
        image: data.imageUrl,
        description: data.description,
      });

      await productRepo.deleteProductComponentsByVariantId(variantId);

      if (data.ingredients?.length) {
        for (const ingredient of data.ingredients) {
          const ingredientProduct = await productRepo.findById(ingredient.id);

          if (!ingredientProduct) {
            throw new AddedProductDoesNotExist(ingredient.id);
          }

          if (ingredientProduct.type !== "ingredient") {
            throw new AddedProductIsNotIngredient();
          }
        }

        const componentsData = data.ingredients.map(
          ({ id, quantity, isRemovable }) => ({
            productVariantId: variant.id,
            productId: id,
            quantity: createIngredientQuantity(quantity),
            isRemovable,
          }),
        );
        await productRepo.saveProductComponents(componentsData);
      }

      return Ok({ product, variant });
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

    if (error instanceof ProductVariantNotFound) {
      return Err(error);
    }

    if (error instanceof AddedProductDoesNotExist) {
      return Err(error);
    }

    if (error instanceof AddedProductIsNotIngredient) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
