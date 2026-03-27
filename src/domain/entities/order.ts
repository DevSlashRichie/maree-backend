import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { type User, UserSchema } from "@/domain/entities/user.ts";
import {
  createOrderStatus,
  InvalidOrderStatusError,
} from "@/domain/value-objects/order-status";
import { ordersTable } from "@/infrastructure/db/schema";
import {
  DateFilterSchema,
  NumberFilterSchema,
  StringFilterSchema,
  UuidFilterSchema,
} from "@/lib/filters";

export type Order = InferSelectModel<typeof ordersTable>;
export const OrderSchema = createSelectSchema(ordersTable);
export type OrderType = z.infer<typeof OrderSchema>;
export type OrderWithUser = {
  order: Order;
  user: User | null;
};
export const OrderWithUserSchema = z.object({
  order: OrderSchema,
  user: UserSchema.nullable(),
});

export const OrderFilterSchema = z.object({
  id: UuidFilterSchema.optional(),
  userId: UuidFilterSchema.optional(),
  branchId: UuidFilterSchema.optional(),
  discountId: UuidFilterSchema.optional(),
  total: NumberFilterSchema.optional(),
  status: StringFilterSchema.optional(),
  note: StringFilterSchema.optional(),
  orderNumber: StringFilterSchema.optional(),
  createdAt: DateFilterSchema.optional(),
});

export type OrderFilters = z.infer<typeof OrderFilterSchema>;

export class OrderNotFound extends Error {
  readonly code = "order_not_found";

  constructor() {
    super("Order not found");
  }
}

export abstract class OrderDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateOrderParams {
  userId: string;
  branchId: string;
  discountId: string;
  total: bigint;
  status: string;
  note?: string;
  orderNumber: string;
}

export function createOrder(params: CreateOrderParams) {
  const parsedUserId = z.string().uuid().parse(params.userId);
  const parsedBranchId = z.string().uuid().parse(params.branchId);
  const parsedDiscountId = z.string().uuid().parse(params.discountId);

  if (params.total <= 0n) {
    throw new InvalidOrderTotalError(params.total);
  }
  const parsedTotal = params.total;

  const parsedStatus = createOrderStatus(params.status);
  const parsedNote = params.note ? z.string().parse(params.note) : undefined;
  const parsedOrderNumber = z.string().min(1).parse(params.orderNumber);

  return {
    userId: parsedUserId,
    branchId: parsedBranchId,
    discountId: parsedDiscountId,
    total: parsedTotal,
    status: parsedStatus,
    note: parsedNote,
    orderNumber: parsedOrderNumber,
  };
}

export class InvalidOrderTotalError extends OrderDomainError {
  readonly code = "INVALID_ORDER_TOTAL";

  constructor(total: bigint) {
    super(`Order total ${total} is invalid. Must be greater than 0.`);
    this.name = "InvalidOrderTotalError";
  }
}

export { InvalidOrderStatusError };
