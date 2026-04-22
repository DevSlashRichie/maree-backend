import { createRoute, z } from "@hono/zod-openapi";
import { CreateDiscountDto, UpdateDiscountDto } from "@/application/dtos/discount";
import { createDiscountUseCase } from "@/application/use-cases/create-discount";
import { deleteDiscountUseCase } from "@/application/use-cases/delete-discount";
import { getDiscountUseCase, DiscountNotFoundError } from "@/application/use-cases/get-discount";
import { listDiscountsUseCase } from "@/application/use-cases/list-discounts";
import { updateDiscountUseCase } from "@/application/use-cases/update-discount";
import { DiscountSchema } from "@/domain/entities/discount";
import { ErrorSchema } from "@/domain/entities/error";
import { logger } from "@/lib/logger";
import { createRouter } from "../utils";

export const discountRouter = createRouter();

discountRouter.openapi(
  createRoute({
    tags: ["Discount"],
    method: "post",
    path: "/",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateDiscountDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Create discount",
        content: {
          "application/json": {
            schema: DiscountSchema,
          },
        },
      },
      500: {
        description: "Unexpected error",
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
    const result = await createDiscountUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();
      logger.error("Error creating discount: %s", err);
      return ctx.json({ code: "unexpected", message: err.message }, 500);
    }

    return ctx.json(result.unwrap(), 201);
  },
);

discountRouter.openapi(
  createRoute({
    tags: ["Discount"],
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "List discounts",
        content: {
          "application/json": {
            schema: z.array(DiscountSchema),
          },
        },
      },
    },
  }),
  async (ctx) => {
    const result = await listDiscountsUseCase();
    return ctx.json(result.unwrap(), 200);
  },
);

discountRouter.openapi(
  createRoute({
    tags: ["Discount"],
    method: "get",
    path: "/{id}",
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "Get discount",
        content: {
          "application/json": {
            schema: DiscountSchema,
          },
        },
      },
      404: {
        description: "Discount not found",
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
    const result = await getDiscountUseCase(id);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof DiscountNotFoundError) {
        return ctx.json({ code: "NOT_FOUND", message: err.message }, 404);
      }
      return ctx.json({ code: "unexpected", message: err.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);

discountRouter.openapi(
  createRoute({
    tags: ["Discount"],
    method: "patch",
    path: "/{id}",
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: {
        content: {
          "application/json": {
            schema: UpdateDiscountDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Update discount",
        content: {
          "application/json": {
            schema: DiscountSchema,
          },
        },
      },
      404: {
        description: "Discount not found",
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
    const result = await updateDiscountUseCase(id, body);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof DiscountNotFoundError) {
        return ctx.json({ code: "NOT_FOUND", message: err.message }, 404);
      }
      return ctx.json({ code: "unexpected", message: err.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);

discountRouter.openapi(
  createRoute({
    tags: ["Discount"],
    method: "delete",
    path: "/{id}",
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "Delete discount",
        content: {
          "application/json": {
            schema: DiscountSchema,
          },
        },
      },
      404: {
        description: "Discount not found",
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
    const result = await deleteDiscountUseCase(id);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof DiscountNotFoundError) {
        return ctx.json({ code: "NOT_FOUND", message: err.message }, 404);
      }
      return ctx.json({ code: "unexpected", message: err.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);
