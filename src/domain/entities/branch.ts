import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { branchsTable, schedulesTable } from "@/infrastructure/db/schema";

export type Branch = InferSelectModel<typeof branchsTable>;
export const BranchSchema = createSelectSchema(branchsTable);
export type BranchType = z.infer<typeof BranchSchema>;

export const ScheduleSchema = createSelectSchema(schedulesTable);
export type ScheduleType = z.infer<typeof ScheduleSchema>;

export const BranchWithSchedulesSchema = BranchSchema.extend({
  schedulesTable: ScheduleSchema.array(),
});
export type BranchWithSchedules = z.infer<typeof BranchWithSchedulesSchema>;

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

export abstract class BranchDomainError extends Error {
  abstract readonly code: string;
}

export interface CreateBranchParams {
  name: string;
  state: string;
}

export function createBranch(params: CreateBranchParams) {
  const parsedName = z.string().min(1).parse(params.name);
  const parsedState = z.enum(["active", "inactive"]).parse(params.state);

  return {
    name: parsedName,
    state: parsedState,
  };
}
