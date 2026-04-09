import z from "zod";
import {
  ProductSchema,
  ProductVariantSchema,
} from "@/domain/entities/product.ts";

export const CreateProductAndVariantDto = z.object({
  name: z.string(),
  status: z.enum(["active", "inactive"]),
  categoryId: z.uuid(),
  price: z.number(),
  imageUrl: z.string(),
  ingredients: z
    .array(
      z.object({
        id: z.uuid(),
        quantity: z.number().positive(),
        isRemovable: z.boolean(),
      }),
    )
    .optional(),
});

export const CreateProductAndVariantResponseDto = z.object({
  product: ProductSchema,
  variant: ProductVariantSchema,
});
