import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import qs from "qs";
import { ProductListSchema } from "@/application/dtos/product";
import { getProductsUseCase } from "@/application/use-cases/get-products";
import { ErrorSchema } from "@/domain/entities/error";
import { ProductFiltersSchema } from "@/domain/entities/product";
import type { State } from "../state";

export const productRouter = new OpenAPIHono<State>();

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/",
    request: {
      query: ProductFiltersSchema
    },
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

    const filterValidation = await ProductFiltersSchema.safeParseAsync(parsedQuery);

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
  },
);
