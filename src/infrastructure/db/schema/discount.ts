import {
  bigint,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const discountsTable = pgTable("discount", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  type: text().notNull(),
  value: bigint({ mode: "bigint" }).notNull(),
  appliesTo: text().notNull(),
  state: text().notNull(),
  startDate: timestamp("started_at").notNull().defaultNow(),
  endDate: timestamp("ended_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
