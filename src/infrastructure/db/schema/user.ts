import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const userTable = pgTable("user", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text().notNull().unique(),
  email: text().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userPasswordTable = pgTable("user_password", {
  userId: uuid("user_id")
    .notNull()
    .primaryKey()
    .references(() => userTable.id),
  password: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
