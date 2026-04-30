import { createRoute, z } from "@hono/zod-openapi";
import qs from "qs";
import {
  PaginationSchema,
  StaffFiltersSchema,
  UserFiltersSchema,
} from "@/application/dtos";
import {
  AssignRoleDto,
  AssignRoleResponseDto,
} from "@/application/dtos/assign-role";
import {
  StaffListSchema,
  UpdateStaffDto,
  UpdateUserDto,
  UserListSchema,
  UserWithStatsSchema,
} from "@/application/dtos/user";
import { UserBranchResponseSchema } from "@/application/dtos/user-branch";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/application/errors/rbac";
import { assignRoleUseCase } from "@/application/use-cases/assign-role";
import { deleteStaffUseCase } from "@/application/use-cases/delete-staff";
import { getActorUseCase } from "@/application/use-cases/get-actor";
import { getStaffUseCase } from "@/application/use-cases/get-staff";
import { getStaffByIdUseCase } from "@/application/use-cases/get-staff-by-id";
import { getUserUseCase } from "@/application/use-cases/get-user";
import { getUserBranchUseCase } from "@/application/use-cases/get-user-branch";
import { getUsersUseCase } from "@/application/use-cases/get-users";
import { removeRoleUseCase } from "@/application/use-cases/remove-role";
import { updateStaffUseCase } from "@/application/use-cases/update-staff";
import { updateUserUseCase } from "@/application/use-cases/update-user";
import { ActorSchema } from "@/domain/entities/actor";
import { ErrorSchema } from "@/domain/entities/error";
import { authzMiddleware, checkPolicyMiddleware } from "../middleware/authz";
import { createRouter } from "../utils";

export const userRouter = createRouter();
//userRouter.use(authzMiddleware(false));

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/",
    middleware: [authzMiddleware(), checkPolicyMiddleware(["read:users"])],
    request: {
      query: UserFiltersSchema.merge(PaginationSchema),
    },
    responses: {
      200: {
        description: "user list",
        content: {
          "application/json": {
            schema: UserListSchema,
          },
        },
      },
      400: {
        description: "invalid filter",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const queryString = ctx.req.query();
    const parsedQuery = qs.parse(queryString);

    const filterValidation =
      await UserFiltersSchema.merge(PaginationSchema).safeParseAsync(
        parsedQuery,
      );

    if (!filterValidation.success) {
      const invalidFields = filterValidation.error.issues.map((e) =>
        e.path.join("."),
      );

      return ctx.json(
        {
          code: "invalid_filter",
          message: `Invalid filter fields: ${invalidFields.join(", ")}`,
        },
        400,
      );
    }

    const { page, limit, ...filters } = filterValidation.data;
    const hasFilters = Object.keys(filters).length > 0;

    const result = await getUsersUseCase(hasFilters ? filters : undefined, {
      page,
      limit,
    });

    return ctx.json(result, 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/staff",
    middleware: [authzMiddleware(), checkPolicyMiddleware(["read:staff"])],
    request: {
      query: StaffFiltersSchema.merge(PaginationSchema),
    },
    responses: {
      200: {
        description: "staff list",
        content: {
          "application/json": {
            schema: StaffListSchema,
          },
        },
      },
      400: {
        description: "invalid filter",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const queryString = ctx.req.query();
    const parsedQuery = qs.parse(queryString);

    const filterValidation =
      await StaffFiltersSchema.merge(PaginationSchema).safeParseAsync(
        parsedQuery,
      );

    if (!filterValidation.success) {
      const invalidFields = filterValidation.error.issues.map((e) =>
        e.path.join("."),
      );

      return ctx.json(
        {
          code: "invalid_filter",
          message: `Invalid filter fields: ${invalidFields.join(", ")}`,
        },
        400,
      );
    }

    const { page, limit, ...filters } = filterValidation.data;
    const hasFilters = Object.keys(filters).length > 0;

    const result = await getStaffUseCase(hasFilters ? filters : undefined, {
      page,
      limit,
    });

    return ctx.json(result, 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/@me",
    middleware: [authzMiddleware(true)],
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
    method: "patch",
    path: "/@me",
    middleware: [authzMiddleware(true)],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateUserDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "user profile updated",
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
    const body = ctx.req.valid("json");

    try {
      const user = await updateUserUseCase(actor.userId, body);
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
    method: "get",
    path: "/@me/branch",
    middleware: [authzMiddleware(true)],
    responses: {
      200: {
        description: "user's assigned branch",
        content: {
          "application/json": {
            schema: UserBranchResponseSchema,
          },
        },
      },
      404: {
        description: "user or branch not found",
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
    const branch = await getUserBranchUseCase(actor.userId);

    if (!branch) {
      return ctx.json(
        {
          code: "branch_not_found",
          message: "No branch assigned to this user",
        },
        404,
      );
    }

    return ctx.json(branch, 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/{userId}",
    middleware: [authzMiddleware(), checkPolicyMiddleware(["read:users"])],
    request: {
      params: z.object({
        userId: z.string().uuid().or(z.string()),
      }),
    },
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: UserWithStatsSchema,
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
    const userId = ctx.req.param("userId");
    const user = await getUserUseCase(userId);

    if (!user) {
      return ctx.json(
        { code: "USER_NOT_FOUND", message: "User not found" },
        404,
      );
    }

    return ctx.json(user, 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/staff/{userId}",
    middleware: [authzMiddleware(), checkPolicyMiddleware(["read:staff"])],
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "staff member with role",
        content: {
          "application/json": {
            schema: ActorSchema,
          },
        },
      },
      404: {
        description: "staff not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const userId = ctx.req.param("userId");
    const staff = await getStaffByIdUseCase(userId);

    if (!staff) {
      return ctx.json(
        { code: "STAFF_NOT_FOUND", message: "Staff member not found" },
        404,
      );
    }

    return ctx.json(staff, 200);
  },
);

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "patch",
    path: "/staff/{userId}",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(), checkPolicyMiddleware(["write:staff"])],
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateStaffDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "staff member updated",
        content: {
          "application/json": {
            schema: ActorSchema,
          },
        },
      },
      404: {
        description: "staff or role not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const userId = ctx.req.param("userId");
    const body = ctx.req.valid("json");
    const result = await updateStaffUseCase(userId, body);

    if (result.isErr()) {
      const error = result.unwrapErr();
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
    method: "post",
    path: "/{userId}/roles",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(), checkPolicyMiddleware(["write:roles"])],
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
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
    path: "/staff/{userId}",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(), checkPolicyMiddleware(["write:staff"])],
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "staff deleted successfully",
        content: {
          "application/json": {
            schema: z.object({ userId: z.string() }),
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
    const userId = ctx.req.param("userId");
    const result = await deleteStaffUseCase(userId);

    if (result.isErr()) {
      const error = result.unwrapErr();
      if (error instanceof ForbiddenError) {
        return ctx.json({ code: error.code, message: error.message }, 403);
      }
      if (error instanceof UserNotFoundError) {
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
    middleware: [authzMiddleware(), checkPolicyMiddleware(["write:roles"])],
    request: {
      params: z.object({
        userId: z.string().uuid(),
        roleName: z.string(),
      }),
    },
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
