import z from "zod";

export const CreateProductDto = z.object({
  name: z.string(),
  status: z.string(),
  categoryId: z.string().uuid(),
  type: z.enum([
    "complete",
    "component",
    "ingredient",
    "ingrediente",
    "complete-product",
    "crepa",
    "waffle",
    "bebida",
  ]),
});
