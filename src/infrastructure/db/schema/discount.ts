import {
  bigint,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { branchsTable } from "./branch.ts";

export const discountsTable = pgTable("discount", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  type: text().notNull(),
  value: bigint({ mode: "bigint" }).notNull(),
  appliesTo: text().notNull().array(),
  state: text().notNull(),
  startDate: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("ended_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const discountBranchesTable = pgTable(
  "discount_branch",
  {
    discountId: uuid("discount_id")
      .notNull()
      .references(() => discountsTable.id),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branchsTable.id),
  },
  (table) => [
    primaryKey({
      columns: [table.discountId, table.branchId],
    }),
  ],
);
