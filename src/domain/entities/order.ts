import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
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

export abstract class OrderError extends Error {
  abstract readonly code: string;
}

export class UnknownError extends OrderError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}

export class OrderNotFound extends OrderError {
  readonly code = "order_not_found";

  constructor() {
    super("Order not found");
  }
}

export class OrderAlreadyClosed extends OrderError {
  readonly code = "order_already_closed";

  constructor() {
    super("Order is already closed");
  }
}

export class OrderAlreadyMark extends OrderError {
  readonly code = "order_already_mark_ready";

  constructor() {
    super("Order is already mark ready");
  }
}
