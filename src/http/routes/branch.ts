import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createBranchUseCase } from "@/application/use-cases/create-branch";
import {
  getBranchByIdUseCase,
  getBranchesUseCase,
} from "@/application/use-cases/get-branch";
import { CreateBranchDto } from "@/domain/dtos/create-branch";
import {
  AlreadyExistsBranch,
  BranchSchema,
  BranchWithSchedulesSchema,
} from "@/domain/entities/branch";
import { ErrorSchema } from "@/domain/entities/error";
import { logger } from "@/lib/logger";
import type { State } from "../state";

export const branchRouter = new OpenAPIHono<State>();

branchRouter.openapi(
  createRoute({
    tags: ["Branch"],
    method: "post",
    path: "/",
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
