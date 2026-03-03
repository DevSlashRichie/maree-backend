import type { InferSelectModel } from "drizzle-orm";
import type { userTable } from "@/infrastructure/db/schema";

export type User = InferSelectModel<typeof userTable>;
