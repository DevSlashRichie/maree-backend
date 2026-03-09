import type { MiddlewareHandler } from "hono";
import { logger } from "../../lib/logger";
import type { State } from "../state";

export const loggerMiddleware: MiddlewareHandler<State> = async (c, next) => {
  const start = Date.now();

  logger.info(`${c.req.method} ${c.req.path}`);

  await next();

  const duration = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${duration}ms`);

  if (c.res.status === 500) {
    const error = c.get("error");
    logger.error(error);
  }

  c.set("logger", logger);
};
