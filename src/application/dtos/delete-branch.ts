import { z } from "@hono/zod-openapi";

export const DeleteBranchParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .openapi("DeleteBranchParams");
