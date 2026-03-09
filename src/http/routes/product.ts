import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createProductUseCase } from "@/application/use-cases/create-product.ts";
import { CreateProductDto } from "@/domain/dtos/create-product.ts";
import { ErrorSchema } from "@/domain/entities/error.ts";
import {
  ProductAlreadyExists,
  ProductSchema,
} from "@/domain/entities/product.ts";
import type { State } from "@/http/state.ts";
import { logger } from "@/lib/logger";

export const productRouter = new OpenAPIHono<State>();

productRouter.openapi(
  createRoute({
    tags: ["Product"],
    method: "post",
    path: "/",
    request: {
      body: {
        required: true,
        description: "product details",
        content: {
          "application/json": {
            schema: CreateProductDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "new product",
        content: {
          "application/json": {
            schema: CreateProductDto,
          },
        },
      },
      409: {
        description: "product already exists",
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
    const result = await createProductUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof ProductAlreadyExists) {
        return ctx.json(
          {
            code: err.name,
            message: "Product already exists",
          },
          409,
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
    return ctx.json(result.unwrap(), 201);
  },
);
