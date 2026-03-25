import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { AlreadyExistsBranch } from "@/application/errors/create-branch";
import { createBranchUseCase } from "@/application/use-cases/create-branch";
import { getBranchUseCase } from "@/application/use-cases/get-branch";
import { BranchSchema } from "@/domain/entities/branch";
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
    path: "/:branch",
    responses: {
      200: {
        description: "branch profile",
        content: {
          "application/json": {
            schema: BranchSchema,
          },
        },
      },
      409: {
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
    const branchName = ctx.req.param("branch");
    const branch = await getBranchUseCase(branchName);

    // TODO: move this error creation into the application layer.
    if (!branch) {
      return ctx.json(
        { message: "branch not found", code: "branch_not_found" },
        409,
      );
    }

    return ctx.json(branch, 200);
  },
);
