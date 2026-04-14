import { Err, Ok, type Result } from "oxide.ts";
import type { CategoryTree } from "@/application/dtos/get-categories";
import { UnknownError } from "@/application/error";
import { GetCategoriesError } from "@/application/errors/get-categories";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getCategoriesUseCase(): Promise<
  Result<CategoryTree, GetCategoriesError>
> {
  return DB.transaction(async (txn) => {
    try {
      const productRepo = new ProductRepo(txn);

      const categories = await productRepo.getAllCategories();

      const buildTree = (parentId: string | null): any => {
        const children = categories
          .filter((cat) => cat.parentId === parentId)
          .map((cat) => ({
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            public: cat.public,
            children: buildTree(cat.id),
          }));

        return children.length > 0 ? children : undefined;
      };

      const categoryTree = categories
        .filter((cat) => cat.parentId === null)
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          parentId: cat.parentId,
          public: cat.public,
          children: buildTree(cat.id),
        }));

      return Ok(categoryTree);
    } catch (error) {
      if (error instanceof GetCategoriesError) {
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
