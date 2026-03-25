import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  AssignRoleDto,
  AssignRoleResponseDto,
} from "@/application/dtos/assign-role";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/application/errors/rbac";
import { assignRoleUseCase } from "@/application/use-cases/assign-role";
import { getActorUseCase } from "@/application/use-cases/get-actor";
import { removeRoleUseCase } from "@/application/use-cases/remove-role";
import { ActorSchema } from "@/domain/entities/actor";
import { ErrorSchema } from "@/domain/entities/error";
import { authzMiddleware } from "../middleware/authz";
import type { State } from "../state";

export const userRouter = new OpenAPIHono<State>();

userRouter.get("/", (ctx) => {
  return ctx.json({});
});

userRouter.post("/", (ctx) => {
  return ctx.json({});
});

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/@me",
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: ActorSchema,
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

    try {
      const user = await getActorUseCase(actor.userId);
      return ctx.json(user, 200);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      throw error;
    }
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "post",
    path: "/{userId}/roles",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(true)],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: AssignRoleDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "role assigned successfully",
        content: {
          "application/json": {
            schema: AssignRoleResponseDto,
          },
        },
      },
      403: {
        description: "forbidden - admin only",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "user or role not found",
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
    const userId = ctx.req.param("userId");
    const body = ctx.req.valid("json");
    const result = await assignRoleUseCase(actor, userId, body);

    if (result.isErr()) {
      const error = result.unwrapErr();
      if (error instanceof ForbiddenError) {
        return ctx.json({ code: error.code, message: error.message }, 403);
      }
      if (error instanceof UserNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      if (error instanceof RoleNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      throw error;
    }

    return ctx.json(result.unwrap(), 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "delete",
    path: "/{userId}/roles/{roleName}",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(true)],
    responses: {
      200: {
        description: "role removed successfully",
        content: {
          "application/json": {
            schema: AssignRoleResponseDto,
          },
        },
      },
      403: {
        description: "forbidden - admin only",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "user or role not found",
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
    const userId = ctx.req.param("userId");
    const roleName = ctx.req.param("roleName");
    const result = await removeRoleUseCase(actor, userId, roleName);

    if (result.isErr()) {
      const error = result.unwrapErr();
      if (error instanceof ForbiddenError) {
        return ctx.json({ code: error.code, message: error.message }, 403);
      }
      if (error instanceof UserNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      if (error instanceof RoleNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      throw error;
    }

    return ctx.json(result.unwrap(), 200);
  },
);
