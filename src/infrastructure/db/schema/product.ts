import { bigint, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { branchsTable } from "./branch.ts";

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
  productId: uuid().notNull(),
  //.references(() => productsTable.id),
});
