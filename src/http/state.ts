import type { MiddlewareHandler } from "hono";
import type { Actor } from "@/domain/entities/actor";
import type { logger } from "@/lib/logger";

type Variables = {
  actor: Actor;
  logger: typeof logger;

  state: {
    authzSecret: string;
    fromNumber: string;
  };
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
