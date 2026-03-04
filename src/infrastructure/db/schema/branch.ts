import {
  integer,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { randomUUIDv7 as uuidv7 } from "bun";
import { userTable } from "./user.ts";

export const branchsTable = pgTable("branch", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  state: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const schedulesTable = pgTable("schedule", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branchsTable.id),
  fromTime: time("from_time").notNull(),
  toTime: time("to_time").notNull(),
  weekday: integer().notNull(),
  timezone: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.branchId, table.userId],
    }),
  ],
);
