import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import type { z } from "zod";
import { branchsTable } from "@/infrastructure/db/schema";

export type Branch = InferSelectModel<typeof branchsTable>;
export const BranchSchema = createSelectSchema(branchsTable);
export type BranchType = z.infer<typeof BranchSchema>;

export abstract class CreateBranchError extends Error {
  abstract readonly code: string;
}

export class UnknownError extends CreateBranchError {
  readonly code = "unknown";

  constructor(err: string) {
    super(`Unknown error: ${err}`);
  }
}

export class AlreadyExistsBranch extends CreateBranchError {
  readonly code = "branch_already_exists";

  constructor() {
    super("Branch already exists");
  }
}
