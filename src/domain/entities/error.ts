import { z } from "zod";

export const ErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});
