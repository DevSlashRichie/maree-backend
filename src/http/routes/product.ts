import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import qs from "qs";
import { ProductListSchema } from "@/application/dtos/product";
import { getProductsUseCase } from "@/application/use-cases/get-products";
import { ErrorSchema } from "@/domain/entities/error";
import { ProductFiltersSchema } from "@/domain/entities/product";
import type { State } from "../state";
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
    tags: ["Products"],
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "product list",
        content: {
          "application/json": {
            schema: ProductListSchema,
          },
        },
      },
      400: {
        description: "invalid filter",
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
    const queryString = ctx.req.query();
    const parsedQuery = qs.parse(queryString);

    const filterValidation = ProductFiltersSchema.safeParse(parsedQuery);

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

    const filters = filterValidation.data;
    const hasFilters = Object.keys(filters).length > 0;

    const products = await getProductsUseCase(hasFilters ? filters : undefined);

    return ctx.json({ products }, 200);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "post",
    path: "/",
    request: {
      body: {
        required: true,
        description: "product data",
        content: {
          "application/json": {
            schema: ProductListSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "product created",
        content: {
          "application/json": {
            schema: ProductListSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const body = await ctx.req.json();

    return ctx.json(body, 201);
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
