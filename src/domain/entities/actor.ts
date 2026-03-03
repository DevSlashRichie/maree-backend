import type { InferSelectModel } from "drizzle-orm";
import type { userTable } from "@/repository/schema";
import type { Role } from "./roles";

export type Actor = InferSelectModel<typeof userTable> & {
  role: Role;
};
