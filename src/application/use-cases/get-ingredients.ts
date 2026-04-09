import { Err, Ok, type Result } from "oxide.ts";
import type { GetIngredientsDtoType } from "@/application/dtos/get-ingredients";
import { UnknownError } from "@/application/error";
import { ProductRepo } from "@/domain/repositories/product-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getIngredientsUseCase(): Promise<
  Result<GetIngredientsDtoType, UnknownError>
> {
  return DB.transaction(async (txn) => {
    try {
      const productRepo = new ProductRepo(txn);
      const categories = await productRepo.getAllCategories();

      const normalize = (value: string) =>
        value
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const ingredientRootCategory = categories.find(
        (cat) => cat.parentId === null && normalize(cat.name) === "ingrediente",
      );

      if (!ingredientRootCategory) {
        return Ok([]);
      }

      const ingredients = await productRepo.findAll({
        type: { eq: "ingredient" },
      });

      const childrenByParent = new Map<string, typeof categories>();
      for (const category of categories) {
        if (!category.parentId) continue;

        const children = childrenByParent.get(category.parentId) ?? [];
        children.push(category);
        childrenByParent.set(category.parentId, children);
      }

      const ingredientCategoryIds = new Set<string>();
      const collectDescendants = (parentId: string) => {
        const children = childrenByParent.get(parentId) ?? [];

        for (const child of children) {
          ingredientCategoryIds.add(child.id);
          collectDescendants(child.id);
        }
      };

      collectDescendants(ingredientRootCategory.id);

      const ingredientsByCategory = new Map<string, typeof ingredients>();
      for (const ingredient of ingredients) {
        if (!ingredientCategoryIds.has(ingredient.categoryId)) continue;

        const items = ingredientsByCategory.get(ingredient.categoryId) ?? [];
        items.push(ingredient);
        ingredientsByCategory.set(ingredient.categoryId, items);
      }

      const result: GetIngredientsDtoType = [];

      const walk = (parentId: string, path: string[]) => {
        const children = childrenByParent.get(parentId) ?? [];

        for (const child of children) {
          const nextPath = [...path, child.name];
          const items = ingredientsByCategory.get(child.id) ?? [];

          if (items.length > 0) {
            result.push({
              path: nextPath,
              items: items.map((prod) => ({
                id: prod.id,
                name: prod.name,
                status: prod.status,
                image: prod.image ?? undefined,
                categoryId: prod.categoryId,
              })),
            });
          }

          walk(child.id, nextPath);
        }
      };

      walk(ingredientRootCategory.id, []);

      return Ok(result);
    } catch (error) {
      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
