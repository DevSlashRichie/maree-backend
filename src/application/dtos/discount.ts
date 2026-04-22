import { z } from "@hono/zod-openapi";

export const CreateDiscountDto = z
  .object({
    name: z.string().min(1),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.bigint(),
    appliesTo: z.array(z.string()).min(0),
    state: z.enum(["active", "inactive"]),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    code: z.string().min(4).max(20).optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    hidden: z.boolean().optional(),
  })
  .openapi("CreateDiscount");

export const UpdateDiscountDto =
  CreateDiscountDto.partial().openapi("UpdateDiscount");
