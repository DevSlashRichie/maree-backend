import z from "zod";

export const CreateBranchDto = z.object({
    name: z.string(),
    state: z.string(),
});