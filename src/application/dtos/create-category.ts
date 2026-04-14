import { z } from "@hono/zod-openapi";
import { createInsertSchema } from "drizzle-zod";
import { categoryTable } from "@/infrastructure/db/schema/product";

export const CreateCategoryDto = createInsertSchema(categoryTable)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    public: z.boolean(),
  })
  .openapi("CreateCategoryDto");

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
