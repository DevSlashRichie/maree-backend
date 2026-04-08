import { createRoute } from "@hono/zod-openapi";
import { deleteCookie, setCookie } from "hono/cookie";
import {
  LoginResultSchema,
  LoginSchema,
} from "@/application/dtos/authentication";
import { RegisterUserDto } from "@/application/dtos/register-user.ts";
import {
  PasswordIsRequired,
  UserAlreadyExistsError,
} from "@/application/errors/register-user";
import { loginUserUseCase } from "@/application/use-cases/login-user";
import { registerUserUseCase } from "@/application/use-cases/register-user.ts";
import { ErrorSchema } from "@/domain/entities/error";
import { UserSchema } from "@/domain/entities/user.ts";
import { logger } from "@/lib/logger";
import { authzMiddleware } from "../middleware/authz";
import { createRouter } from "../utils";

export const authenticationRouter = createRouter();

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
            schema: LoginResultSchema,
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
      state.AUTHZ_SECRET,
      state.FROM_NUMBER,
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

    const loginResult = result.unwrap();

    if (loginResult.success) {
      setCookie(ctx, "tok", loginResult.token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 43830, // 1 day
      });
    }

    return ctx.json(loginResult, 200);
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
      ctx.get("state").AUTHZ_SECRET,
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

authenticationRouter.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/logout",
    middleware: [authzMiddleware(true)],
    responses: {
      204: {
        description: "logged out",
      },
    },
  }),
  async (ctx) => {
    deleteCookie(ctx, "tok", { path: "/" });

    return ctx.body(null, 204);
  },
);
