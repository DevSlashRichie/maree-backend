import { z } from "@hono/zod-openapi";
import { OrderSchema, OrderWithUserSchema } from "@/domain/entities/order.ts";

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

export const OrdersWithUsersDto = z
  .object({
    orders: z.array(OrderWithUserSchema),
  })
  .openapi("OrdersWithUsers");

export const closeOrderDto = z
  .object({
    id: z.string(),
  })
  .openapi("CloseOrder");

export const markOrderReadyDto = z
  .object({
    id: z.string(),
  })
  .openapi("MarkOrderReady");
