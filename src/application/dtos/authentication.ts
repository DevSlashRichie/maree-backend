import { z } from "@hono/zod-openapi";
import { ActorSchema } from "@/domain/entities/actor";

export const LoginSchema = z
  .object({
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
      z.object({ type: z.literal("test") }),
    ]),
  })
  .openapi("Login");

export const LoginResultSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("token"),
      token: z.string(),
      expiresAt: z.iso.datetime(),
      actor: ActorSchema,
    }),
    z.object({
      type: z.literal("required_action"),
      required_action: z.literal("login_with_sent_code"),
    }),
  ])
  .openapi("LoginResult");

export interface TokenPayloadType {
  userId: string;
  role: string | null;
}
