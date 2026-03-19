import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { productTable } from "@/infrastructure/db/schema/product";
import {
  DateFilterSchema,
  StringFilterSchema,
  UuidFilterSchema,
} from "@/lib/filters";

export type Product = InferSelectModel<typeof productTable>;

export const ProductSchema = createSelectSchema(productTable);
export type ProductType = z.infer<typeof ProductSchema>;

export const ProductFiltersSchema = z.object({
  id: UuidFilterSchema.optional(),
  name: StringFilterSchema.optional(),
  status: StringFilterSchema.optional(),
  categoryId: UuidFilterSchema.optional(),
  createdAt: DateFilterSchema.optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
