import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { userTable } from "@/infrastructure/db/schema";

export type User = InferSelectModel<typeof userTable>;

export const UserSchema = createSelectSchema(userTable);
