import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import type { TokenPayloadType } from "@/application/dtos/authentication";
import type { logger } from "@/lib/logger";

export const StateEnvSchema = z.object({
  AUTHZ_SECRET: z.string(),
  FROM_NUMBER: z.string(),
  GOOGLE_WALLET_ISSUER_ID: z.string(),
  GOOGLE_WALLET_CREDENTIALS: z.string(),
  GOOGLE_WALLET_CREDENTIALS_DECODED: z.string().nullish(),
  GOOGLE_WALLET_CLASS_SUFFIX: z.string().optional(),
});

type Variables = {
  actor: TokenPayloadType;
  logger: typeof logger;
  error: Error;
  state: z.infer<typeof StateEnvSchema>;
};

export interface State {
  Variables: Variables;
}

export const createStateMiddleware: (
  state: State["Variables"]["state"],
) => MiddlewareHandler<State> = (state) => {
  return async (ctx, next) => {
    ctx.set("state", state);
    await next();
  };
};

export const stateMiddleware: MiddlewareHandler<State> = async (ctx, next) => {
  const state = {
    AUTHZ_SECRET: process.env.AUTHZ_SECRET!,
    FROM_NUMBER: process.env.FROM_NUMBER!,
    GOOGLE_WALLET_ISSUER_ID: process.env.GOOGLE_WALLET_ISSUER_ID!,
    GOOGLE_WALLET_CREDENTIALS: process.env.GOOGLE_WALLET_CREDENTIALS!,
    GOOGLE_WALLET_CLASS_SUFFIX: process.env.GOOGLE_WALLET_CLASS_SUFFIX,
  };

  const GOOGLE_WALLET_CREDENTIALS_DECODED = state.GOOGLE_WALLET_CREDENTIALS
    ? JSON.parse(state.GOOGLE_WALLET_CREDENTIALS)
    : null;

  ctx.set("state", {
    ...state,
    GOOGLE_WALLET_CREDENTIALS_DECODED,
  });
  await next();
};
