import { z } from "@hono/zod-openapi";
import { OrderSchema } from "@/domain/entities/order.ts";

export const OrderHistoryDto = z
  .object({
    orders: z.array(OrderSchema),
  })
  .openapi("OrderHistory");

export const IncomingOrdersDto = z
  .object({
    orders: z.array(OrderSchema),
  })
  .openapi("IncomingOrders");
