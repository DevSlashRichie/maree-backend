import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const rolesTable = pgTable("roles", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    name: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),

});



export const rolePoliciesTable = pgTable("role_policies", {
    roleId: uuid("role_id").notNull().references(() => rolesTable.id),
    policyId: uuid("policy_id")
}, (table) => [
    primaryKey({
        columns: [table.roleId, table.policyId]
    })
]);
