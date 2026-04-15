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
  ProductAlreadyExists,
  ProductVariantAlreadyExists,
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
        const ingredientCategoryIds: string[] = [];

        for (const ingredient of data.ingredients) {
          const ingredientProduct = await productRepo.findById(ingredient.id);

          if (!ingredientProduct) {
            throw new AddedProductDoesNotExist(ingredient.id);
          }

          if (ingredientProduct.type !== "ingredient") {
            throw new AddedProductIsNotIngredient();
          }

          ingredientCategoryIds.push(ingredientProduct.categoryId);
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

      console.log(product);
      console.log(productVariant);

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
