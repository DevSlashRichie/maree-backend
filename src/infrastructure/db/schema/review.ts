import { randomUUIDv7 as uuidv7 } from "bun";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { branchsTable } from "./branch.ts";
import { ordersTable } from "./order";
import { userTable } from "./user";

export const reviewsTable = pgTable("review", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branchsTable.id),
  satisfactionRate: integer("satisfaction_rate").notNull(),
  notes: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
