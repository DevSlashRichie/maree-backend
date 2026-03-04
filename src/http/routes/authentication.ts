import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getUserUseCase } from "@/application/use-cases/get-user";
import { ErrorSchema } from "@/domain/entities/error";
import { UserSchema } from "@/domain/entities/user";
import type { State } from "../state";
import { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import { loginUserUserCase } from "@/application/use-cases/login-user";

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
    const user = await loginUserUserCase(body, ctx.get("state").authzSecret);

    if (user.isErr()) {
      const err = user.unwrapErr();
      if (err.type === "invalid_credentials") {
        return ctx.json({ message: err.message }, 400);
      }

      return ctx.json({ message: "forbidden" }, 403);
    }

    return ctx.json(user.unwrap(), 200);
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

    if (user.isNone()) {
      return ctx.json({ message: "user not found" }, 404);
    }

    return ctx.json(user.unwrap(), 200);
  },
);
