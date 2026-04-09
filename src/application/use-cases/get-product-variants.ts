import type {
  ProductVariantFilters,
  ProductVariantWithProduct,
} from "@/application/dtos/product-variant";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getProductVariantsUseCase(
  filters?: ProductVariantFilters,
): Promise<ProductVariantWithProduct[]> {
  const variants = await DB.transaction(async (txn) => {
    const productRepo = new ProductRepo(txn);

    const vars = await productRepo.findAllVariants(filters);
    return vars;
  });

  return variants;
}
