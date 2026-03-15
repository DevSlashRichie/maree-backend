import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import type { logger } from "@/lib/logger";
import type { TokenPayloadType } from "@/application/dtos/authentication";

export const StateEnvSchema = z.object({
  AUTHZ_SECRET: z.string(),
  FROM_NUMBER: z.string(),
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
