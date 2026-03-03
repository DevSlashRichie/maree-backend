import { pgTable, text, timestamp, uuid, bigint, integer} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { ordersTable } from "./order";
import { usersTable } from "./user";

export const reviewsTable = pgTable("review", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    orderId: uuid().notNull().references(() => ordersTable.id),
    userId: uuid().notNull().references(() => usersTable.id),
    satisfactionRate: integer(),
    notes: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});