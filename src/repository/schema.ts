import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const usersTable = pgTable("users", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    name: text().notNull(),
    email: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

});
