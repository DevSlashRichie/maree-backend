import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import { loginUserUseCase } from "@/application/use-cases/login-user";
import { registerUserUseCase } from "@/application/use-cases/register-user.ts";
import { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import { RegisterUserDto } from "@/domain/dtos/register-user.ts";
import { ErrorSchema } from "@/domain/entities/error";
import {
  PasswordIsRequired,
  UserAlreadyExistsError,
  UserSchema,
} from "@/domain/entities/user.ts";
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
    const state = ctx.get("state");

    const result = await loginUserUseCase(
      body,
      state.authzSecret,
      state.fromNumber,
    );

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
    tags: ["Auth"],
    method: "post",
    path: "/register",
    request: {
      body: {
        required: true,
        description: "user details",
        content: {
          "application/json": {
            schema: RegisterUserDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "user schema",
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
      },
      400: {
        description: "password is required",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      409: {
        description: "user already exists",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected error",
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
    const result = await registerUserUseCase(
      body,
      ctx.get("state").authzSecret,
    );

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof UserAlreadyExistsError) {
        return ctx.json(
          {
            code: err.name,
            message: "Email or phone is already used",
          },
          409,
        );
      }

      if (err instanceof PasswordIsRequired) {
        return ctx.json(
          {
            code: err.name,
            message: "Password is required",
          },
          400,
        );
      }

      logger.error("Error: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: "unexpected",
        },
        500,
      );
    }

    setCookie(ctx, "tok", result.unwrap().token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 43830, // 1 day
    });
    return ctx.json(result.unwrap().user, 201);
  },
);
