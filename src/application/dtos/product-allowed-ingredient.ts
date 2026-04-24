import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { productAllowedIngredientsTable } from "@/infrastructure/db/schema/product";

export const ProductAllowedIngredientSchema = createSelectSchema(
  productAllowedIngredientsTable,
);

export const CreateAllowedIngredientDto = z
  .object({
    productVariantId: z.string().uuid(),
    allowedProductId: z.string().uuid().optional(),
    allowedCategoryId: z.string().uuid().optional(),
  })
  .refine((data) => data.allowedProductId || data.allowedCategoryId, {
    message: "Either allowedProductId or allowedCategoryId must be provided",
    path: ["allowedProductId"],
  });

export type CreateAllowedIngredientDto = z.infer<
  typeof CreateAllowedIngredientDto
>;
