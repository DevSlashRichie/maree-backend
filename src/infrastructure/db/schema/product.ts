import { bigint, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const productVariantsTable = pgTable("product_variant", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  price: bigint({ mode: "bigint" }).notNull(),
  image: text(),
  productId: uuid().notNull(),
  //.references(() => productsTable.id),
});
