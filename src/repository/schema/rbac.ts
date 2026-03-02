import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

export const rolesTable = pgTable("role", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    name: text().notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rolesRelations = relations(rolesTable, ({ many }) => ({
    rolePolicies: many(rolePoliciesTable),
}));

export const policyTable = pgTable("policy", {
    id: uuid().primaryKey().$defaultFn(() => uuidv7()),
    name: text().notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const policyRelations = relations(policyTable, ({ many }) => ({
    rolePolicies: many(rolePoliciesTable),
}));

export const rolePoliciesTable = pgTable("role_policy", {
    roleId: uuid("role_id").notNull().references(() => rolesTable.id),
    policyId: uuid("policy_id").notNull().references(() => policyTable.id),
}, (table) => [
    primaryKey({
        columns: [table.roleId, table.policyId]
    })
]);

export const rolePoliciesRelations = relations(rolePoliciesTable, ({ one }) => ({
    role: one(rolesTable, {
        fields: [rolePoliciesTable.roleId],
        references: [rolesTable.id],
    }),
    policy: one(policyTable, {
        fields: [rolePoliciesTable.policyId],
        references: [policyTable.id],
    }),
}));


