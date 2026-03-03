import type { MiddlewareHandler } from "hono";
import { logger } from "../../lib/logger";

type LoggerVariables = {
  logger: typeof logger;
};

export const loggerMiddleware: MiddlewareHandler<{
  Variables: LoggerVariables;
}> = async (c, next) => {
  const start = Date.now();

  logger.info(`${c.req.method} ${c.req.path}`);

  await next();

  const duration = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${duration}ms`);

  c.set("logger", logger);
};
