import { z } from "@hono/zod-openapi";

const ProductVariantComponentSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  isRemovable: z.boolean(),
});

export const GetProductVariantDto = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  price: z.bigint(),
  productId: z.string(),
  categoryId: z.string(),
  status: z.string(),
  type: z.string(),
  createdAt: z.date(),
  components: z.array(ProductVariantComponentSchema),
});

export type ProductVariantWithComponents = z.infer<typeof GetProductVariantDto>;
