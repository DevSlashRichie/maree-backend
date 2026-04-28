import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  BranchDiscountSchema,
  BranchStaffSchema,
} from "@/application/dtos/branch-response";
import { CreateBranchDto } from "@/application/dtos/create-branch";
import { UpdateBranchDto } from "@/application/dtos/update-branch";
import { createBranchUseCase } from "@/application/use-cases/create-branch";
import {
  BranchNotFoundError,
  deleteBranchUseCase,
} from "@/application/use-cases/delete-branch";
import {
  getBranchByIdUseCase,
  getBranchesUseCase,
  getRewardsByBranchUseCase,
  getStaffByBranchUseCase,
} from "@/application/use-cases/get-branch";
import { updateBranchUseCase } from "@/application/use-cases/update-branch";
import {
  AlreadyExistsBranch,
  BranchNotFound,
  BranchSchema,
  BranchWithSchedulesSchema,
} from "@/domain/entities/branch";
import { ErrorSchema } from "@/domain/entities/error";
import { logger } from "@/lib/logger";
import { authzMiddleware, checkPolicyMiddleware } from "../middleware/authz";
import type { State } from "../state";

export const branchRouter = new OpenAPIHono<State>();

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "post",
    path: "/",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:branches"]),
    ],
    request: {
      body: {
        required: true,
        description: "branch details",
        content: {
          "application/json": {
            schema: CreateBranchDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "new branch",
        content: {
          "application/json": {
            schema: BranchSchema,
          },
        },
      },
      409: {
        description: "branch name already used",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected",
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
    const result = await createBranchUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof AlreadyExistsBranch) {
        return ctx.json(
          {
            code: err.name,
            message: "The name is already used",
          },
          409,
        );
      }

      logger.error("Unknown error: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: "unexpected",
        },
        500,
      );
    }

    return ctx.json(result.unwrap(), 201);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "list of branches with schedules",
        content: {
          "application/json": {
            schema: BranchWithSchedulesSchema.array(),
          },
        },
      },
      500: {
        description: "unexpected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const branches = await getBranchesUseCase();
    return ctx.json(branches, 200);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "get",
    path: "/{id}",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "branch profile with schedules",
        content: {
          "application/json": {
            schema: BranchWithSchedulesSchema,
          },
        },
      },
      404: {
        description: "branch not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const id = ctx.req.param("id");
    const branch = await getBranchByIdUseCase(id);

    if (!branch) {
      return ctx.json(
        { message: "branch not found", code: "branch_not_found" },
        404,
      );
    }

    return ctx.json(branch, 200);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "get",
    path: "/{id}/staff",
    middleware: [authzMiddleware(true), checkPolicyMiddleware(["read:staff"])],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "staff of a branch",
        content: {
          "application/json": {
            schema: BranchStaffSchema.array(),
          },
        },
      },
      404: {
        description: "branch not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const id = ctx.req.param("id");
    const result = await getStaffByBranchUseCase(id);
    return ctx.json(result.users, 200);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "get",
    path: "/{id}/rewards",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "rewards of a branch",
        content: {
          "application/json": {
            schema: BranchDiscountSchema.array(),
          },
        },
      },
      404: {
        description: "branch not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const id = ctx.req.param("id");
    const result = await getRewardsByBranchUseCase(id);
    return ctx.json(result, 200);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "patch",
    path: "/{id}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:branches"]),
    ],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateBranchDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "branch updated",
        content: {
          "application/json": {
            schema: BranchWithSchedulesSchema,
          },
        },
      },
      404: {
        description: "branch not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const { id } = ctx.req.valid("param");
    const body = await ctx.req.json();

    const result = await updateBranchUseCase(id, body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof BranchNotFound) {
        return ctx.json({ code: err.code, message: err.message }, 404);
      }

      return ctx.json({ code: "unexpected", message: "unexpected" }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "delete",
    path: "/{id}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:branches"]),
    ],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      204: {
        description: "branch deleted",
      },
      404: {
        description: "branch not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "unexpected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),

  async (ctx) => {
    const { id } = ctx.req.valid("param");

    const result = await deleteBranchUseCase(id);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof BranchNotFoundError) {
        return ctx.json({ code: err.code, message: err.message }, 404);
      }

      logger.error("Unknown error: %s", err);

      return ctx.json({ code: "unexpected", message: "unexpected" }, 500);
    }

    return ctx.body(null, 204);
  },
);
