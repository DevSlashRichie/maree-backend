import { z } from "@hono/zod-openapi";
import { createInsertSchema } from "drizzle-zod";
import { categoryTable } from "@/infrastructure/db/schema/product";

export const UpdateCategoryDto = createInsertSchema(categoryTable)
  .omit({ id: true, createdAt: true })
  .partial()
  .extend({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    public: z.boolean().optional(),
  })
  .openapi("UpdateCategoryDto");

export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
