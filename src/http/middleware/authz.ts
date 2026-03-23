import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { decrypt } from "paseto-ts/v4";
import type { TokenPayloadType } from "@/application/dtos/authentication";
import { checkPolicies } from "@/application/use-cases/check-policies";
import { logger } from "@/lib/logger";
import type { State } from "../state";

export function authzMiddleware(strict: boolean = true) {
  const middleware: MiddlewareHandler<State> = async (ctx, next) => {
    const token = getCookie(ctx, "tok");

    if (!token) {
      if (strict) {
        logger.warn("Request without token.");
        return ctx.json({ message: "forbidden!" }, 403);
      } else {
        return await next();
      }
    }

    try {
      const { payload } = decrypt<TokenPayloadType>(
        ctx.get("state").AUTHZ_SECRET,
        token,
      );

      ctx.set("actor", payload);
    } catch (err) {
      logger.error(err);
      return ctx.json({ message: "forbidden!" }, 403);
    }

    await next();
  };

  return middleware;
}

// we create a closure to configure the middleware
export function checkPolicyMiddleware(requiredPolicies: string[]) {
  const middleware: MiddlewareHandler<State> = async (ctx, next) => {
    const actor = ctx.get("actor");

    // if for any reason is not set, then return err.
    if (!actor) {
      logger.warn("Request without actor");
      return ctx.json({ message: "forbidden!" }, 403);
    }

    if (!actor || !actor.role) {
      logger.warn("Request without role");
      return ctx.json({ message: "forbidden!" }, 403);
    }

    const arePoliciesValid = checkPolicies(actor.role, requiredPolicies);
    if (!arePoliciesValid) {
      logger.warn("Request via incorrect role requested.");
      return ctx.json({ message: "forbidden!" }, 403);
    }

    await next();
  };

  return middleware;
}
