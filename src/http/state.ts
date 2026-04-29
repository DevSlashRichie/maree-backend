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
  APPLE_WALLET_TEAM_ID: z.string().optional(),
  APPLE_WALLET_PASS_TYPE_ID: z.string().optional(),
  APPLE_WALLET_WWDR_PEM: z.string().optional(),
  APPLE_WALLET_CERT_PEM: z.string().optional(),
  APPLE_WALLET_KEY_PEM: z.string().optional(),
  APPLE_WALLET_KEY_PASSPHRASE: z.string().optional(),
  APPLE_WALLET_WWDR_PEM_DECODED: z.string().nullish(),
  APPLE_WALLET_CERT_PEM_DECODED: z.string().nullish(),
  APPLE_WALLET_KEY_PEM_DECODED: z.string().nullish(),
  LOCAL_STORAGE_PATH: z.string().optional(),
  LOCAL_STORAGE_BASE_URL: z.string().optional(),
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
    AUTHZ_SECRET: process.env.AUTHZ_SECRET ?? "",
    FROM_NUMBER: process.env.FROM_NUMBER ?? "",
    GOOGLE_WALLET_ISSUER_ID: process.env.GOOGLE_WALLET_ISSUER_ID ?? "",
    GOOGLE_WALLET_CREDENTIALS: process.env.GOOGLE_WALLET_CREDENTIALS ?? "",
    GOOGLE_WALLET_CLASS_SUFFIX: process.env.GOOGLE_WALLET_CLASS_SUFFIX,
    APPLE_WALLET_TEAM_ID: process.env.APPLE_WALLET_TEAM_ID,
    APPLE_WALLET_PASS_TYPE_ID: process.env.APPLE_WALLET_PASS_TYPE_ID,
    APPLE_WALLET_WWDR_PEM: process.env.APPLE_WALLET_WWDR_PEM,
    APPLE_WALLET_CERT_PEM: process.env.APPLE_WALLET_CERT_PEM,
    APPLE_WALLET_KEY_PEM: process.env.APPLE_WALLET_KEY_PEM,
    APPLE_WALLET_KEY_PASSPHRASE: process.env.APPLE_WALLET_KEY_PASSPHRASE,
    LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH,
    LOCAL_STORAGE_BASE_URL: process.env.LOCAL_STORAGE_BASE_URL,
  };

  const GOOGLE_WALLET_CREDENTIALS_DECODED = state.GOOGLE_WALLET_CREDENTIALS
    ? JSON.parse(state.GOOGLE_WALLET_CREDENTIALS)
    : null;

  const decode = (b64: string | undefined) =>
    b64 ? Buffer.from(b64, "base64").toString() : null;

  ctx.set("state", {
    ...state,
    GOOGLE_WALLET_CREDENTIALS_DECODED,
    APPLE_WALLET_WWDR_PEM_DECODED: decode(state.APPLE_WALLET_WWDR_PEM),
    APPLE_WALLET_CERT_PEM_DECODED: decode(state.APPLE_WALLET_CERT_PEM),
    APPLE_WALLET_KEY_PEM_DECODED: decode(state.APPLE_WALLET_KEY_PEM),
  });
  await next();
};
