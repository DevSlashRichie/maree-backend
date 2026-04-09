import type { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { productVariantsTable } from "@/infrastructure/db/schema/product";

export type ProductVariant = InferSelectModel<typeof productVariantsTable>;

export const ProductVariantSchema = createSelectSchema(productVariantsTable);

export type ProductVariantType = z.infer<typeof ProductVariantSchema>;
