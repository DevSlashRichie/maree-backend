import { Err, Ok, type Result } from "oxide.ts";
import type { ProductVariantWithComponents } from "@/application/dtos/get-product-variant";
import { UnknownError } from "@/application/error";
import {
  GetProductVariantError,
  ProductVariantNotFound,
} from "@/application/errors/get-product-variant";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getProductVariantUseCase(
  variantId: string,
): Promise<Result<ProductVariantWithComponents, GetProductVariantError>> {
  return DB.transaction(async (txn) => {
    try {
      const productRepo = new ProductRepo(txn);
      console.log("lets make thhe repo");
      const result =
        await productRepo.findProductVariantWithComponents(variantId);
      console.log(result);

      if (!result) {
        throw new ProductVariantNotFound();
      }

      const { variant, product, components } = result;
      const categories = await productRepo.getAllCategories();

      const categoriesById = new Map(
        categories.map((category) => [category.id, category]),
      );
      const path: string[] = [];

      let currentCategoryId: string | null = product.categoryId;
      while (currentCategoryId) {
        const category = categoriesById.get(currentCategoryId);
        if (!category) {
          break;
        }

        path.push(category.name);
        currentCategoryId = category.parentId;
      }

      path.reverse();

      const variantWithComponents: ProductVariantWithComponents = {
        id: variant.id,
        name: variant.name,
        image: variant.image,
        price: variant.price,
        productId: product.id,
        categoryId: product.categoryId,
        path,
        description: variant.description ?? "",
        status: product.status,
        type: product.type,
        createdAt: variant.createdAt,
        components: components.map((c) => ({
          id: c.id,
          productId: c.productId,
          productName: c.productName || "",
          quantity: c.quantity,
          isRemovable: c.isRemovable,
        })),
      };

      return Ok(variantWithComponents);
    } catch (error) {
      if (error instanceof GetProductVariantError) {
        return Err(error);
      }

      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
