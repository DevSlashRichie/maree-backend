import z from "zod";

export const RegisterReviewDto = z.object({
  orderId: z.uuid(),
  userId: z.uuid(),
  branchId: z.uuid(),
  satisfactionRate: z.int().min(0).max(5),
  notes: z.optional(z.string()),
});
