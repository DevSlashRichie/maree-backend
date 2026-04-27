import type { ProductVariantType } from "@/domain/entities/product-variant";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getAllowedIngredientsUseCase(
  variantId: string,
): Promise<ProductVariantType[]> {
  const variants = await DB.transaction(async (txn) => {
    const productRepo = new ProductRepo(txn);

    const vars = await productRepo.findAllowedIngredientsForVariant(variantId);

    if (!vars.length) {
      const all = await productRepo.findAllVariants();
      return all.filter((it) => it.product.type === "ingredient");
    }

    return vars.map((it) => ({
      ...it.prod,
    }));
  });

  return variants;
}
