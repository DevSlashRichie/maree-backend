import z from "zod";

export const CreateProductDto = z.object({
  name: z.string(),
  status: z.string(),
  categoryId: z.string().uuid(),
  type: z.enum(["complete", "ingredient"]),
});
