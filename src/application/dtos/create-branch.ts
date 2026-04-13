import z from "zod";

export const CreateScheduleDto = z.object({
  fromTime: z.string(),
  toTime: z.string(),
  weekday: z.number().int().min(0).max(6),
  timezone: z.string(),
})
  .openapi("CreateBranchDto");

export const CreateBranchDto = z
  .object({
    name: z.string(),
    state: z.string(),
    schedules: z.array(CreateScheduleDto).default([]),
  })
  .openapi("CreateBranchDto");
