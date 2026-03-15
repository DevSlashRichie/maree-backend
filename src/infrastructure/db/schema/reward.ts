import { randomUUIDv7 as uuidv7 } from "bun";
import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { branchsTable } from "./branch.ts";
import { userTable } from "./user.ts";

export const rewardsTable = pgTable("reward", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  description: text().notNull(),
  status: text().notNull(),
  cost: bigint({ mode: "bigint" }).notNull(),
  image: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rewardRedemptionsTable = pgTable("reward_redemption", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  rewardId: uuid("reward_id")
    .notNull()
    .references(() => rewardsTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branchsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
