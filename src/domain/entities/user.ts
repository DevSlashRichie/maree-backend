import { type InferSelectModel } from "drizzle-orm";
import type { userTable } from "@/repository/schema";

export type User = InferSelectModel<typeof userTable>;
