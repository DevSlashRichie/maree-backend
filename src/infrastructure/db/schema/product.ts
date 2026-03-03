import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { branchsTable } from "./branch.ts";

export const categoryTable = pgTable("category", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  description: text(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categoryTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productTable = pgTable("product", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  status: text().notNull(),
  categoryId: uuid()
    .notNull()
    .references(() => categoryTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantsTable = pgTable("product_variant", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  price: bigint({ mode: "bigint" }).notNull(),
  image: text(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branchsTable.id),
  productId: uuid()
    .notNull()
    .references(() => productTable.id),
});
