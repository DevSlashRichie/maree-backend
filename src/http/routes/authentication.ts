import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import { loginUserUseCase } from "@/application/use-cases/login-user";
import { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import { ErrorSchema } from "@/domain/entities/error";
import { logger } from "@/lib/logger";
import type { State } from "../state";

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

    setCookie(ctx, "tok", result.unwrap().token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return ctx.json({ token: "ok" }, 200);
  },
);
