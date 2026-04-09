import type { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { categoryTable } from "@/infrastructure/db/schema/product";

export type Category = InferSelectModel<typeof categoryTable>;

export const CategorySchema = createSelectSchema(categoryTable);
export type CategoryType = z.infer<typeof CategorySchema>;
