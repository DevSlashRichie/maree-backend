import type { Category } from "@/domain/entities/category";
import { CategoryRepo } from "@/domain/repositories/category-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getCategoriesUseCase(): Promise<Category[]> {
  const categories = await DB.transaction(async (txn) => {
    const categoryRepo = new CategoryRepo(txn);

    const cats = await categoryRepo.findAll();
    return cats;
  });

  return categories;
}
