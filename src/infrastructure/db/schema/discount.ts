import { randomUUIDv7 as uuidv7 } from "bun";
import {
  bigint,
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { branchsTable } from "./branch.ts";

export const discountsTable = pgTable("discount", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  type: text().notNull(),
  applyMethod: text("apply_method").notNull(),
  applyCode: text("apply_code"),
  value: bigint({ mode: "bigint" }).notNull(),
  appliesTo: text("applies_to").notNull().array(),
  state: text().notNull(),
  startDate: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("ended_at", { withTimezone: true }).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  hidden: boolean().notNull().default(false),
  maxUses: integer("max_uses"),
  public: boolean().notNull().default(true),
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
