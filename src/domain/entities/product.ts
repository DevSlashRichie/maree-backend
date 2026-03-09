import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { productTable } from "@/infrastructure/db/schema";

export type Product = InferSelectModel<typeof productTable>;
export const ProductSchema = createSelectSchema(productTable);

export abstract class CreateProductError extends Error {
  abstract readonly code: string;
}

export class ProductAlreadyExists extends CreateProductError {
  readonly code = "product_already_exists";

  constructor() {
    super("Product already exists");
  }
}

export class UnknownError extends CreateProductError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unkown error: ${err}`);
  }
}
