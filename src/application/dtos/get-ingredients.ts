import { z } from "@hono/zod-openapi";

const IngredientItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  image: z.string().url().optional(),
  categoryId: z.string().uuid(),
  price: z.bigint(),
});

export const GetIngredientsDto = z.array(
  z.object({
    path: z.array(z.string().min(1)).min(1),
    items: z.array(IngredientItemSchema),
  }),
);

export type GetIngredientsDtoType = z.infer<typeof GetIngredientsDto>;
