import { z } from "@hono/zod-openapi";
import { OrderSchema, OrderWithUserSchema } from "@/domain/entities/order.ts";
import { ORDER_STATUSES } from "@/domain/value-objects/order-status";
import { ProductVariantSchema } from "@/domain/entities/product";

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

export const UpdateOrderStatusDto = z
  .object({
    status: z.enum(ORDER_STATUSES),
  })
  .openapi("UpdateOrderStatus");

export const CreateOrderFromAdminDto = z
  .object({
    items: z.array(
      z.object({
        id: z.uuid(),
        quantity: z.int(),
        notes: z.string().optional(),
        modifiers: z.array(
          z.object({
            id: z.uuid(),
            delta: z.int(),
          }),
        ),
      }),
    ),
    totalPriceCents: z.int(),
    discountId: z.uuid().optional(),
    branchId: z.uuid(),
    status: z.enum(ORDER_STATUSES).optional(),
    userId: z.uuid().optional(),
  })
  .openapi("CreateOrderFromAdmin");

export const DetailedOrderDto = OrderSchema.extend({
  items: z.array(
    z.object({
      id: z.uuid(),
      quantity: z.int(),
      notes: z.string().nullish(),
      pricingSnapshot: z.bigint(),
      variantId: z.string(),
      productVariantsTable: z
        .object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          image: z.string().nullish(),
        })
        .nullish(),
      modifiers: z.array(
        z.object({
          id: z.uuid(),
          productVariantId: z.string(),
          quantityDelta: z.int(),
          productVariantsTable: z
            .object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullish(),
              image: z.string().nullish(),
            })
            .nullish(),
        }),
      ),
    }),
  ),
});
