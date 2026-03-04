import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getUserUseCase } from "@/application/use-cases/get-user";
import { ErrorSchema } from "@/domain/entities/error";
import { UserSchema } from "@/domain/entities/user";
import type { State } from "../state";
import { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import { loginUserUseCase } from "@/application/use-cases/login-user";
import { logger } from "@/lib/logger";

export const authenticationRouter = new OpenAPIHono<State>();

authenticationRouter.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/login",
    request: {
      body: {
        required: true,
        description: "login details",
        content: {
          "application/json": {
            schema: LoginSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: TokenSchema,
          },
        },
      },
      403: {
        description: "forbidden",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      400: {
        description: "invalid request",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const body = await ctx.req.json();
    const result = await loginUserUseCase(body, ctx.get("state").authzSecret);

    if (result.isErr()) {
      const err = result.unwrapErr();

      logger.warn("Failed login: (%s) %s", err.code, err.message);

      return ctx.json(
        {
          code: "forbidden",
          message: "forbidden",
        },
        403,
      );
    }

    return ctx.json({ token: result.unwrap().token }, 200);
  },
);

authenticationRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/@me",
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
      },
      404: {
        description: "user not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    const user = await getUserUseCase(actor.id);

    // TODO: move this error creation into the application layer.
    if (!user) {
      return ctx.json(
        { message: "user not found", code: "user_not_found" },
        404,
      );
    }

    return ctx.json(user, 200);
  },
);
