import z from "zod";

const modifier = z.object({
  id: z.uuid(),
  delta: z.int(),
  build_your_own: z.boolean().nullish(),
});

export const Item = z.object({
  id: z.uuid(),
  quantity: z.int(),
  notes: z.string().optional(),
  modifiers: z.array(modifier),
  isDiscounted: z.boolean().optional(),
  discountAmountCents: z.int().nonnegative().optional(),
});

export const CreateOrderDto = z.object({
  items: z.array(Item),
  totalPriceCents: z.int(),
  discountId: z.uuid().optional(),
  rewardId: z.uuid().optional(),
  branchId: z.uuid(),
  orderType: z.enum(["mesa", "recoger"]),
});
