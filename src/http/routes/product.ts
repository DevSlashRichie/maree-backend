import { createRoute } from "@hono/zod-openapi";
import qs from "qs";
import { CreateProductDto } from "@/application//dtos/create-product.ts";
import { ProductListSchema } from "@/application/dtos/product";
import {
  ProductVariantFiltersSchema,
  ProductVariantListSchema,
} from "@/application/dtos/product-variant";
import { ProductAlreadyExists } from "@/application/errors/create-product";
import { createProductUseCase } from "@/application/use-cases/create-product.ts";
import { getCategoriesUseCase } from "@/application/use-cases/get-categories";
import { getProductVariantsUseCase } from "@/application/use-cases/get-product-variants";
import { getProductsUseCase } from "@/application/use-cases/get-products";
import { CategoryListSchema } from "@/domain/entities/category";
import { ErrorSchema } from "@/domain/entities/error";
import { ProductFiltersSchema, ProductSchema } from "@/domain/entities/product";
import { logger } from "@/lib/logger";
import { authzMiddleware, checkPolicyMiddleware } from "../middleware/authz";
import { createRouter } from "../utils";

export const productRouter = createRouter();
productRouter.use(authzMiddleware(false));

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/",
    request: {
      query: ProductFiltersSchema,
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

    const filterValidation =
      await ProductFiltersSchema.safeParseAsync(parsedQuery);

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
    method: "get",
    path: "/categories",
    responses: {
      200: {
        description: "category list",
        content: {
          "application/json": {
            schema: CategoryListSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const categories = await getCategoriesUseCase();

    return ctx.json({ categories }, 200);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/variants",
    request: {
      query: ProductVariantFiltersSchema,
    },
    responses: {
      200: {
        description: "product variant list",
        content: {
          "application/json": {
            schema: ProductVariantListSchema,
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
      await ProductVariantFiltersSchema.safeParseAsync(parsedQuery);

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

    const variants = await getProductVariantsUseCase(
      hasFilters ? filters : undefined,
    );

    return ctx.json({ variants }, 200);
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
            schema: ProductSchema,
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
    middleware: checkPolicyMiddleware(["products:write"]),
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
