import z from "zod";

export const RegisterReviewDto = z.object({
    orderId: z.uuid(),
    userId: z.uuid(),
    branchId: z.uuid(),
    satisfactionRate: z.int(),
    notes: z.optional(z.string()),
})