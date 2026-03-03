import { pgTable, text, timestamp, uuid, bigint, integer} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { usersTable } from "./user.ts"
import { branchsTable } from "./branch.ts";
import { discountsTable } from "./discount.ts";
import { productVariantsTable } from "./product.ts";

export const ordersTable = pgTable("order", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    userId: uuid().notNull().references(() => usersTable.id),
    branchId: uuid().notNull().references(() => branchsTable.id),
    discountId: uuid().notNull().references(() => discountsTable.id),
    total: bigint({ mode: "bigint" }).notNull(),
    status: text().notNull(),
    note: text(),
    orderNumber: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    orderId: uuid().notNull().references(() => ordersTable.id),
    variantId: uuid().notNull().references(() => productVariantsTable.id),
    quantity: integer().notNull(),
    pricingSnapshot: bigint({mode : "bigint"}).notNull(),
    notes: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

