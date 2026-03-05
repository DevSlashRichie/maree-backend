import { z } from "zod";

export const LoginSchema = z.object({
  identity: z.string().min(1),
  method: z.discriminatedUnion("type", [
    z.object({ type: z.literal("phone") }),
    z.object({
      type: z.literal("code"),
      value: z
        .string()
        .length(6)
        .regex(/^[0-9]+$/)
        .transform((val) => Number(val)),
    }),
    z.object({ type: z.literal("password"), value: z.string().min(1) }),
  ]),
});

export const TokenSchema = z.union([
  z.object({
    token: z.string().min(1),
  }),
  z.object({
    success: z.literal(true),
  }),
]);
