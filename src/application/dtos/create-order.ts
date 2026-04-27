import z from "zod";
import { ORDER_STATUSES } from "@/domain/value-objects/order-status";

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
});

export const CreateOrderDto = z.object({
  items: z.array(Item),
  totalPriceCents: z.int(),
  discountId: z.uuid().optional(),
  branchId: z.uuid(),
  status: z.enum(ORDER_STATUSES).optional(),
});
