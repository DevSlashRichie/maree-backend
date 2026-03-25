import { randomUUIDv7 as uuidv7 } from "bun";
import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { branchsTable } from "./branch.ts";
import { discountsTable } from "./discount.ts";
import { productVariantsTable } from "./product.ts";
import { userTable } from "./user.ts";

export const ordersTable = pgTable("order", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branchsTable.id),
  discountId: uuid("discount_id")
    .notNull()
    .references(() => discountsTable.id),
  total: bigint({ mode: "bigint" }).notNull(),
  status: text().notNull(),
  note: text(),
  orderNumber: text("order_number").notNull(),
  tableNumber: integer("table_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariantsTable.id),
  quantity: integer().notNull(),
  pricingSnapshot: bigint("pricing_snapshot", { mode: "bigint" }).notNull(),
  notes: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
