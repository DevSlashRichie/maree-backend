import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import { ProductVariantNotFound } from "@/application/errors/get-product-variant";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function deleteProductVariantUseCase(
  id: string,
): Promise<Result<void, ProductVariantNotFound | UnknownError>> {
  try {
    const productRepo = new ProductRepo(DB);

    const variant = await productRepo.findProductVariantWithComponents(id);
    if (!variant) {
      return Err(new ProductVariantNotFound());
    }

    await productRepo.softDeleteVariant(id);

    return Ok(undefined);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
