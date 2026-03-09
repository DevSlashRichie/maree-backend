import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "paseto-ts/v4";
import { getActorUseCase } from "@/application/use-cases/get-actor";
import type { ActorType } from "@/domain/entities/actor";
import { logger } from "@/lib/logger";
import type { State } from "../state";

export const authzMiddleware: MiddlewareHandler<State> = async (ctx, next) => {
  const token = getCookie(ctx, "tok");

  if (!token) {
    logger.warn("Request without token.");
    return ctx.json({ message: "forbidden!" }, 403);
  }

  try {
    const { payload } = verify<ActorType>(ctx.get("state").AUTHZ_SECRET, token);

    const actor = await getActorUseCase(payload.id);

    if (!actor) {
      return ctx.json({ message: "forbidden!" }, 403);
    }

    ctx.set("actor", actor);
  } catch (err) {
    logger.error(err);
    return ctx.json({ message: "forbidden!" }, 403);
  }

  await next();
};
