import z from "zod";

export const CreateCategoryDto = z.object({
  name: z.string(),
  description: z.string(),
  parentId: z.string().uuid().optional(),
});
