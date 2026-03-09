import { z } from "@hono/zod-openapi";
import { ProductSchema } from "@/domain/entities/product";

export const ProductListSchema = z
  .object({
    products: z.array(ProductSchema),
  })
  .openapi("ProductList");
