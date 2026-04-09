type FlavorFamily = "dulce" | "salado";

type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
};

type ValidateIngredientCompositionParams = {
  productType: string;
  productCategoryId: string;
  ingredientCategoryIds: string[];
  categories: CategoryNode[];
};

export function validateIngredientComposition(
  params: ValidateIngredientCompositionParams,
): void {
  if (params.ingredientCategoryIds.length === 0) {
    return;
  }

  if (params.productType !== "complete-product") {
    throw new IngredientsOnlyForCompleteProductError(params.productType);
  }

  const productFlavor = resolveFlavorFamily(
    params.productCategoryId,
    params.categories,
  );

  // Product categories without a dulce/salado branch can use any ingredient.
  if (!productFlavor) {
    return;
  }

  for (const ingredientCategoryId of params.ingredientCategoryIds) {
    const ingredientFlavor = resolveFlavorFamily(
      ingredientCategoryId,
      params.categories,
    );

    if (ingredientFlavor !== productFlavor) {
      throw new IncompatibleIngredientFlavorError(productFlavor);
    }
  }
}

export class IngredientsOnlyForCompleteProductError extends Error {
  readonly code = "INGREDIENTS_ONLY_FOR_COMPLETE_PRODUCT";

  constructor(productType: string) {
    super(
      `Only complete-product can have ingredients. Got product type: ${productType}.`,
    );
    this.name = "IngredientsOnlyForCompleteProductError";
  }
}

export class IncompatibleIngredientFlavorError extends Error {
  readonly code = "INCOMPATIBLE_INGREDIENT_FLAVOR";

  constructor(productFlavor: FlavorFamily) {
    super(
      `Ingredient flavor is incompatible with ${productFlavor} product. Allowed ingredients must belong to the same flavor family.`,
    );
    this.name = "IncompatibleIngredientFlavorError";
  }
}

function resolveFlavorFamily(
  startCategoryId: string,
  categories: CategoryNode[],
): FlavorFamily | null {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const visited = new Set<string>();

  let current = categoryById.get(startCategoryId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);

    const flavor = mapCategoryNameToFlavor(current.name);
    if (flavor) {
      return flavor;
    }

    current = current.parentId ? categoryById.get(current.parentId) : undefined;
  }

  return null;
}

function mapCategoryNameToFlavor(name: string): FlavorFamily | null {
  const tokens = normalize(name)
    .split(/[^a-z]+/)
    .filter(Boolean);

  if (tokens.some((token) => token === "dulce" || token === "dulces")) {
    return "dulce";
  }

  if (
    tokens.some(
      (token) =>
        token === "salado" ||
        token === "salada" ||
        token === "salados" ||
        token === "saladas",
    )
  ) {
    return "salado";
  }

  return null;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
