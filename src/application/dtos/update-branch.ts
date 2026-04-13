import { z } from "zod";

export const UpdateBranchDto = z.object({
  name: z.string().optional(),
  state: z.enum(["active", "inactive"]).optional(),
  schedules: z.array(
    z.object({
      weekday: z.number(),
      fromTime: z.string(),
      toTime: z.string(),
      timezone: z.string(),
    })
  ).optional(),
}).openapi("UpdateBranchDto");