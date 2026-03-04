import { z } from "zod";

export const LoginSchema = z.object({
  identity: z.discriminatedUnion("type", [
    z.object({ type: z.literal("phone"), value: z.string().min(1) }),
    z.object({ type: z.literal("email"), value: z.string().min(1) }),
  ]),
  method: z.discriminatedUnion("type", [
    z.object({ type: z.literal("phone") }),
    z.object({ type: z.literal("password"), value: z.string().min(1) }),
  ]),
});

export const TokenSchema = z.object({
  token: z.string().min(1),
});
