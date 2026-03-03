import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { ordersTable } from "./order";
import { userTable } from "./user";

export const reviewsTable = pgTable("review", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderId: uuid()
    .notNull()
    .references(() => ordersTable.id),
  userId: uuid()
    .notNull()
    .references(() => userTable.id),
  satisfactionRate: integer(),
  notes: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
