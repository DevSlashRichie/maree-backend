import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { userTable } from "./user.ts";

export const notificationTemplateTable = pgTable("notification_template", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  subject: text().notNull(),
  body: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const notificationTriggerTable = pgTable("notification_table", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull(),
  eventKey: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notificationTemplateTriggerTable = pgTable(
  "notification_template_trigger",
  {
    templateId: uuid("template_id")
      .notNull()
      .references(() => notificationTemplateTable.id),
    triggerId: uuid("trigger_id")
      .notNull()
      .references(() => notificationTriggerTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.templateId, table.triggerId],
    }),
  ],
);

export const notificationTable = pgTable("notification", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  provider: text().notNull(),
  state: text().notNull(),
  body: text().notNull(),
  templateId: uuid("template_id").references(
    () => notificationTemplateTable.id,
  ),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
