import { createRoute } from "@hono/zod-openapi";
import qs from "qs";
import z from "zod";
import { CreateProductDto } from "@/application/dtos/create-product.ts";
import {
  CreateProductAndVariantDto,
  CreateProductAndVariantResponseDto,
} from "@/application/dtos/create-product-and-variant.ts";
import { GetCategoriesDto } from "@/application/dtos/get-categories";
import { GetProductVariantDto } from "@/application/dtos/get-product-variant";
import { ProductListSchema } from "@/application/dtos/product";
import {
  ProductVariantFiltersSchema,
  ProductVariantListSchema,
} from "@/application/dtos/product-variant";
import { UploadProductImageResponseDto } from "@/application/dtos/upload-product-image.ts";
import { ProductAlreadyExists } from "@/application/errors/create-product";
import {
  AddedProductDoesNotExist,
  AddedProductIsNotIngredient,
  ProductVariantAlreadyExists,
} from "@/application/errors/create-product-variant.ts";
import { NoCategoriesFound } from "@/application/errors/get-categories";
import { ProductVariantNotFound } from "@/application/errors/get-product-variant";
import { ImageIsEmpty } from "@/application/errors/upload-product-image.ts";
import { createProductUseCase } from "@/application/use-cases/create-product.ts";
import { createProductAndVariantUseCase } from "@/application/use-cases/create-product-and-variant.ts";
import { getCategoriesUseCase } from "@/application/use-cases/get-categories";
import { getProductVariantUseCase } from "@/application/use-cases/get-product-variant";
import { getProductVariantsUseCase } from "@/application/use-cases/get-product-variants";
import { getProductsUseCase } from "@/application/use-cases/get-products";
import { uploadProductImageUseCase } from "@/application/use-cases/upload-product-image.ts";
import { ErrorSchema } from "@/domain/entities/error";
import { ProductFiltersSchema, ProductSchema } from "@/domain/entities/product";
import { logger } from "@/lib/logger";
import { authzMiddleware } from "../middleware/authz";
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
    path: "/image",
    request: {
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z.object({
              image: z.file().openapi({
                type: "string",
                format: "binary",
              }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "uploaded product image",
        content: {
          "application/json": {
            schema: UploadProductImageResponseDto,
          },
        },
      },
      400: {
        description: "invalid body",
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
    // middleware: checkPolicyMiddleware(["products:write"]),
  }),
  async (ctx) => {
    const { image } = ctx.req.valid("form");
    console.log("image extracted");

    if (!(image instanceof File)) {
      console.log("not an instance of file");
      return ctx.json(
        {
          code: "invalid_body",
          message: "The 'image' field must be a file",
        },
        400,
      );
    }

    const bytes = new Uint8Array(await image.arrayBuffer());
    console.log("bytes extracted");

    const result = await uploadProductImageUseCase({
      image: {
        bytes,
        name: image.name,
        contentType: image.type,
      },
    });
    console.log("use case completed");

    if (result.isErr()) {
      const err = result.unwrapErr();

      logger.error("Error: %s", err);

      if (err instanceof ImageIsEmpty) {
        return ctx.json(
          {
            code: "invalid_body",
            message: "The 'image' field must be a file",
          },
          400,
        );
      }

      return ctx.json(
        {
          code: "unexpected",
          message: err.message,
        },
        500,
      );
    }

    return ctx.json(result.unwrap(), 201);
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
    // middleware: checkPolicyMiddleware(["products:write"]),
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

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "post",
    path: "/product-variant",
    request: {
      body: {
        required: true,
        description: "product details",
        content: {
          "application/json": {
            schema: CreateProductAndVariantDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "new product variant",
        content: {
          "application/json": {
            schema: CreateProductAndVariantResponseDto,
          },
        },
      },
      409: {
        description: "Product variant already exists or product does not exist",
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
    // middleware: checkPolicyMiddleware(["products:write"]),
  }),
  async (ctx) => {
    const body = await ctx.req.json();
    const result = await createProductAndVariantUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof ProductVariantAlreadyExists) {
        return ctx.json(
          {
            code: err.name,
            message: "Product variant already exists",
          },
          409,
        );
      }

      if (err instanceof AddedProductDoesNotExist) {
        return ctx.json(
          {
            code: err.name,
            message: "Added ingredients do not exist",
          },
          409,
        );
      }

      if (err instanceof AddedProductIsNotIngredient) {
        return ctx.json(
          {
            code: err.name,
            message: "Added ingredients are not ingredients",
          },
          409,
        );
      }

      logger.error("Errorh: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: err.message,
        },
        500,
      );
    }
    return ctx.json(result.unwrap(), 201);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/categories",
    responses: {
      200: {
        description: "category tree",
        content: {
          "application/json": {
            schema: z.object({
              categories: GetCategoriesDto,
            }),
          },
        },
      },
      404: {
        description: "no categories found",
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
    const result = await getCategoriesUseCase();

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof NoCategoriesFound) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      logger.error("Error: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: err.message,
        },
        500,
      );
    }

    const categories = result.unwrap();

    return ctx.json({ categories }, 200);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/variant/{id}",
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "product variant with components",
        content: {
          "application/json": {
            schema: GetProductVariantDto,
          },
        },
      },
      404: {
        description: "product variant not found",
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
    const result = await getProductVariantUseCase(id);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof ProductVariantNotFound) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      logger.error("Error: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: err.message,
        },
        500,
      );
    }

    return ctx.json(result.unwrap(), 200);
  },
);
