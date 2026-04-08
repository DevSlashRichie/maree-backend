import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import {
  createProductStatus,
  InvalidProductStatusError,
} from "@/domain/value-objects/product-status";
import { productTable } from "@/infrastructure/db/schema/product";
import {
  DateFilterSchema,
  StringFilterSchema,
  UuidFilterSchema,
} from "@/lib/filters";

export type Product = InferSelectModel<typeof productTable>;

export const ProductSchema = createSelectSchema(productTable).extend({
  type: z.enum(["complete", "component"]),
});
export type ProductType = z.infer<typeof ProductSchema>;

export const ProductFiltersSchema = z.object({
  id: UuidFilterSchema.optional(),
  name: StringFilterSchema.optional(),
  status: StringFilterSchema.optional(),
  categoryId: UuidFilterSchema.optional(),
  createdAt: DateFilterSchema.optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export abstract class ProductDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateProductParams {
  name: string;
  status: string;
  categoryId: string;
  image?: string;
}

export function createProduct(params: CreateProductParams) {
  const parsedName = z.string().min(1).parse(params.name);
  const parsedStatus = createProductStatus(params.status);
  const parsedCategoryId = z.string().uuid().parse(params.categoryId);
  const parsedImage = params.image
    ? z.string().url().parse(params.image)
    : undefined;

  return {
    name: parsedName,
    status: parsedStatus,
    categoryId: parsedCategoryId,
    image: parsedImage,
  };
}

export { InvalidProductStatusError };
