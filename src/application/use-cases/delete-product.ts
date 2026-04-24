import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import { ProductNotFound } from "@/application/errors/product";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function deleteProductUseCase(
  id: string,
): Promise<Result<void, ProductNotFound | UnknownError>> {
  try {
    const productRepo = new ProductRepo(DB);

    const product = await productRepo.findById(id);
    if (!product) {
      return Err(new ProductNotFound());
    }

    await productRepo.softDelete(id);

    return Ok(undefined);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
