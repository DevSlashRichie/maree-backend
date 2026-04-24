import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function deleteAllowedIngredientUseCase(id: string) {
  await DB.transaction(async (txn) => {
    const productRepo = new ProductRepo(txn);
    await productRepo.deleteAllowedIngredient(id);
  });
}
