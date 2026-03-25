import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { branchsTable } from "@/infrastructure/db/schema";

export type Branch = InferSelectModel<typeof branchsTable>;
export const BranchSchema = createSelectSchema(branchsTable);
export type BranchType = z.infer<typeof BranchSchema>;

export abstract class BranchDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateBranchParams {
  name: string;
  state: string;
}

export function createBranch(params: CreateBranchParams) {
  const parsedName = z.string().min(1).parse(params.name);
  const parsedState = z.string().min(1).parse(params.state);

  return {
    name: parsedName,
    state: parsedState,
  };
}
