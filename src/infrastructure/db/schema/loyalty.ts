import { randomUUIDv7 as uuidv7 } from "bun";
import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { ordersTable } from "./order.ts";
import { userTable } from "./user.ts";

export const loyaltyCardsTable = pgTable("loyalty_card", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id)
    .unique(),
  currentBalance: bigint("current_balance", { mode: "bigint" })
    .notNull()
    .default(0n),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const loyaltyTransactionsTable = pgTable("loyalty_transaction", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  loyaltyCardId: uuid("loyalty_card_id")
    .notNull()
    .references(() => loyaltyCardsTable.id),
  orderId: uuid("order_id").references(() => ordersTable.id),
  value: bigint({ mode: "bigint" }).notNull(),
  transactionType: text("transaction_type")
    .notNull()
    .$type<"earned" | "redeemed">(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
