import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
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
export type BranchWithSchedulesFromDb = z.infer<
  typeof BranchWithSchedulesSchema
>;
export type BranchWithSchedules = BranchWithSchedulesFromDb;

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

export interface Schedule {
  fromTime: string;
  toTime: string;
  weekday: number;
  timezone: string;
}

export interface CreateBranchParams {
  name: string;
  state: string;
  schedules?: Schedule[];
}

export interface BranchResult {
  name: string;
  state: "active" | "inactive";
  schedules: Schedule[] | undefined;
}

export function createBranch(params: CreateBranchParams): BranchResult {
  // Validar name: no vacío (pero permite espacios)
  const parsedName = z
    .string()
    .refine((name) => name !== "", { message: "Name is required" })
    .parse(params.name);

  const parsedState = z.enum(["active", "inactive"]).parse(params.state);

  let parsedSchedules: Schedule[] | undefined;

  if (params.schedules) {
    parsedSchedules = params.schedules.map((schedule) => {
      const fromTime = z
        .string()
        .refine(
          (time) =>
            time !== "" && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time),
          { message: "Invalid schedule fromTime" },
        )
        .parse(schedule.fromTime);

      const toTime = z
        .string()
        .refine(
          (time) =>
            time !== "" && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time),
          { message: "Invalid schedule toTime" },
        )
        .parse(schedule.toTime);

      const weekday = z
        .number()
        .int()
        .min(0, { message: "Invalid weekday" })
        .max(6, { message: "Invalid weekday" })
        .parse(schedule.weekday);

      const timezone = z
        .string()
        .refine((tz) => tz !== "", { message: "Invalid schedule timezone" })
        .parse(schedule.timezone);

      return { fromTime, toTime, weekday, timezone };
    });
  }

  return {
    name: parsedName,
    state: parsedState,
    schedules: parsedSchedules,
  };
}

export abstract class BranchStaffError extends Error {
  abstract readonly code: string;
}

export class BranchStaffNotFound extends BranchStaffError {
  readonly code = "branch_staff_not_found";

  constructor() {
    super("Branch staff not found");
  }
}

export abstract class BranchRewardsError extends Error {
  abstract readonly code: string;
}

export class BranchRewardsNotFound extends BranchRewardsError {
  readonly code = "branch_rewards_not_found";

  constructor() {
    super("Branch rewards not found");
  }
}

export class BranchNotFound extends BranchDomainError {
  readonly code = "branch_not_found";
  constructor() {
    super("Branch not found");
  }
}
