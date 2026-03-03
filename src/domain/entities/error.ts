import { z } from "zod";

export const ErrorSchema = z.object({
  message: z.string().min(1),
});

export type DomainError = z.infer<typeof ErrorSchema>;
