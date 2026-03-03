import {
  integer,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { userTable } from "./user.ts";

export const branchsTable = pgTable("branch", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  state: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schedulesTable = pgTable("schedule", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  branchId: uuid()
    .notNull()
    .references(() => branchsTable.id),
  fromTime: time().notNull(),
  toTime: time().notNull(),
  weekday: integer().notNull(),
  timezone: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const staffTable = pgTable(
  "staff",
  {
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branchsTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => [
    primaryKey({
      columns: [table.branchId, table.userId],
    }),
  ],
);
