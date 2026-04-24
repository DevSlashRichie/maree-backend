import { randomUUIDv7 as uuidv7 } from "bun";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categoryTable = pgTable("category", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  description: text(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categoryTable.id),
  public: boolean().notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productTable = pgTable("product", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  image: text(),
  name: text().notNull(),
  status: text().notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoryTable.id),
  type: text().notNull().$type<"complete" | "ingredient">(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const productVariantsTable = pgTable("product_variant", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  description: text(),
  price: bigint({ mode: "bigint" }).notNull(),
  image: text(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const productComponentsTable = pgTable("product_component", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantsTable.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id),
  quantity: integer().notNull(),
  isRemovable: boolean("is_removable").notNull().default(false),
});
