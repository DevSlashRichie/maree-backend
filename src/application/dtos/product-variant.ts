import { z } from "@hono/zod-openapi";
import { ProductSchema } from "@/domain/entities/product";
import { ProductVariantSchema } from "@/domain/entities/product-variant";
import { StringFilterSchema, UuidFilterSchema } from "@/lib/filters";

export const ProductVariantFiltersSchema = z.object({
  productId: UuidFilterSchema.optional(),
  type: StringFilterSchema.optional(),
});

export const ProductVariantWithProductSchema = ProductVariantSchema.extend({
  product: ProductSchema,
});

export const ProductVariantListSchema = z.object({
  variants: z.array(ProductVariantWithProductSchema),
});

export type ProductVariantFilters = z.infer<typeof ProductVariantFiltersSchema>;
export type ProductVariantWithProduct = z.infer<
  typeof ProductVariantWithProductSchema
>;
