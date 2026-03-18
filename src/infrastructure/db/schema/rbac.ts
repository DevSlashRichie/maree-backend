import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { userTable } from "./user";

export const rolesTable = pgTable("role", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const policyTable = pgTable("policy", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rolePoliciesTable = pgTable(
  "role_policy",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesTable.id),
    policyId: uuid("policy_id")
      .notNull()
      .references(() => policyTable.id),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.policyId],
    }),
  ],
);

export const userRoleTable = pgTable(
  "user_role",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.userId],
    }),
  ],
);
