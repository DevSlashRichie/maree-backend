import z from "zod";

const modifier = z.object({
  id: z.uuid(),
  delta: z.int(),
});

export const Item = z.object({
  id: z.uuid(),
  quantity: z.int(),
  notes: z.string().optional(),
  modifiers: z.array(modifier),
});

export const CreateOrderDto = z.object({
  items: z.array(Item),
  totalPriceCents: z.int(),
  discountId: z.uuid().optional(),
  branchId: z.uuid(),
});
