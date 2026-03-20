import type { Product, ProductFilters } from "@/domain/entities/product";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getProductsUseCase(
  filters?: ProductFilters,
): Promise<Product[]> {
  const products = await DB.transaction(async (txn) => {
    const productRepo = new ProductRepo(txn);

    const prods = await productRepo.findAll(filters);
    return prods;
  });

  return products;
}
