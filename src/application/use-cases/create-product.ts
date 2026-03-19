import { Err, Ok, type Result } from "oxide.ts";
import type { z } from "zod";
import type { CreateProductDto } from "@/domain/dtos/create-product.ts";
import {
  type CreateProductError,
  ProductAlreadyExists,
} from "@/domain/entities/product.ts";
import { UnknownError } from "@/domain/entities/user.ts";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function createProductUseCase(
  data: z.infer<typeof CreateProductDto>,
): Promise<Result<z.infer<typeof CreateProductDto>, CreateProductError>> {
  try {
    const productRepo = new ProductRepo(DB);

    const productAlreadyExists = await productRepo.existsProduct(data.name);
    if (productAlreadyExists) {
      throw new ProductAlreadyExists();
    }

    // TODO: validate categoryId

    const product = await productRepo.saveProduct({
      name: data.name,
      status: data.status,
      categoryId: data.categoryId,
    });

    return Ok(product);
  } catch (error) {
    if (error instanceof ProductAlreadyExists) {
      return Err(error);
    }
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknowm error",
      ),
    );
  }
}
