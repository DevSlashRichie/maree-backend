import { z } from "zod";

export const UserBranchResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  state: z.string(),
  createdAt: z.string(),
});

export type UserBranchResponse = z.infer<typeof UserBranchResponseSchema>;
