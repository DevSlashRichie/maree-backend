import { createRoute } from "@hono/zod-openapi";
import qs from "qs";
import z from "zod";
import { CreateCategoryDto } from "@/application/dtos/create-category.ts";
import { CreateProductDto } from "@/application/dtos/create-product.ts";
import {
  CreateProductAndVariantDto,
  CreateProductAndVariantResponseDto,
} from "@/application/dtos/create-product-and-variant.ts";
import { GetCategoriesDto } from "@/application/dtos/get-categories";
import { GetIngredientsDto } from "@/application/dtos/get-ingredients";
import { GetProductVariantDto } from "@/application/dtos/get-product-variant";
import { ProductListSchema } from "@/application/dtos/product";
import {
  CreateAllowedIngredientDto,
  ProductAllowedIngredientSchema,
} from "@/application/dtos/product-allowed-ingredient.ts";
import {
  ProductVariantFiltersSchema,
  ProductVariantListSchema,
} from "@/application/dtos/product-variant";
import { UpdateCategoryDto } from "@/application/dtos/update-category.ts";
import { UploadProductImageResponseDto } from "@/application/dtos/upload-product-image.ts";
import {
  CategoryAlreadyExistsError,
  CategoryCycleDetectedError,
  CategoryNotFoundError,
  ParentCategoryNotFoundError,
} from "@/application/errors/category";
import { ProductAlreadyExists } from "@/application/errors/create-product";
import {
  AddedProductDoesNotExist,
  AddedProductIsNotIngredient,
  IncompatibleIngredientFlavor,
  IngredientsOnlyForCompleteProduct,
  InvalidIngredientQuantity,
  ProductVariantAlreadyExists,
} from "@/application/errors/create-product-variant.ts";
import { ProductVariantNotFound } from "@/application/errors/get-product-variant";
import { ProductNotFound } from "@/application/errors/product";
import {
  AddedProductDoesNotExist as UpdateAddedProductDoesNotExist,
  AddedProductIsNotIngredient as UpdateAddedProductIsNotIngredient,
  IncompatibleIngredientFlavor as UpdateIncompatibleIngredientFlavor,
  IngredientsOnlyForCompleteProduct as UpdateIngredientsOnlyForCompleteProduct,
  InvalidIngredientQuantity as UpdateInvalidIngredientQuantity,
  ProductVariantNotFound as UpdateProductVariantNotFound,
} from "@/application/errors/update-product.ts";
import { ImageIsEmpty } from "@/application/errors/upload-product-image.ts";
import { createAllowedIngredientUseCase } from "@/application/use-cases/create-allowed-ingredient";
import { createCategoryUseCase } from "@/application/use-cases/create-category.ts";
import { createProductUseCase } from "@/application/use-cases/create-product.ts";
import { createProductAndVariantUseCase } from "@/application/use-cases/create-product-and-variant.ts";
import { deleteAllowedIngredientUseCase } from "@/application/use-cases/delete-allowed-ingredient";
import { deleteProductUseCase } from "@/application/use-cases/delete-product.ts";
import { deleteProductVariantUseCase } from "@/application/use-cases/delete-product-variant.ts";
import { getAllowedIngredientsUseCase } from "@/application/use-cases/get-allowed-ingredients";
import { getCategoriesUseCase } from "@/application/use-cases/get-categories";
import { getIngredientsUseCase } from "@/application/use-cases/get-ingredients";
import { getProductVariantUseCase } from "@/application/use-cases/get-product-variant";
import { getProductVariantsUseCase } from "@/application/use-cases/get-product-variants";
import { getProductsUseCase } from "@/application/use-cases/get-products";
import { updateCategoryUseCase } from "@/application/use-cases/update-category.ts";
import { updateProductAndVariantUseCase } from "@/application/use-cases/update-product-and-variant.ts";
import { uploadProductImageUseCase } from "@/application/use-cases/upload-product-image.ts";
import { CategorySchema } from "@/domain/entities/category";
import { ErrorSchema } from "@/domain/entities/error";
import {
  ProductFiltersSchema,
  ProductSchema,
  ProductVariantSchema,
} from "@/domain/entities/product";
import { AzureBlobStorageAdapter } from "@/infrastructure/azure/blob-storage.ts";
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
    method: "get",
    path: "/variants/allowed",
    request: {
      query: z.object({
        variantId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "allowed product variant list",
        content: {
          "application/json": {
            schema: z.array(ProductVariantSchema),
          },
        },
      },
    },
  }),
  async (ctx) => {
    const { variantId } = ctx.req.valid("query");

    const variants = await getAllowedIngredientsUseCase(variantId);

    return ctx.json(variants, 200);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "post",
    path: "/variants/allowed-ingredients",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateAllowedIngredientDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "new allowed ingredient rule",
        content: {
          "application/json": {
            schema: ProductAllowedIngredientSchema,
          },
        },
      },
      400: {
        description: "invalid request",
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
    const result = await createAllowedIngredientUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      return ctx.json(
        {
          code: "bad_request",
          message: err.message,
        },
        400,
      );
    }

    return ctx.json(result.unwrap(), 201);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "delete",
    path: "/{id}/ingredients/{ingredientId}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      204: {
        description: "allowed ingredient rule deleted",
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
    await deleteAllowedIngredientUseCase(id);

    return ctx.body(null, 204);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "post",
    path: "/{id}/ingredients",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
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

    const filesPort = new AzureBlobStorageAdapter();

    const result = await uploadProductImageUseCase(filesPort, {
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
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
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
    path: "/variants",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
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
      400: {
        description: "invalid ingredient quantity",
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

      if (err instanceof IngredientsOnlyForCompleteProduct) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof IncompatibleIngredientFlavor) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof InvalidIngredientQuantity) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          400,
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
    method: "post",
    path: "/categories",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:categories"]),
    ],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateCategoryDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "new category",
        content: {
          "application/json": {
            schema: CategorySchema,
          },
        },
      },
      400: {
        description: "parent category not found or cycle detected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      409: {
        description: "category already exists",
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
    const result = await createCategoryUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof CategoryAlreadyExistsError) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof ParentCategoryNotFoundError) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          400,
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

    return ctx.json(result.unwrap(), 201);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "patch",
    path: "/categories/{id}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:categories"]),
    ],
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateCategoryDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "updated category",
        content: {
          "application/json": {
            schema: CategorySchema,
          },
        },
      },
      400: {
        description: "parent category not found or cycle detected",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "category not found",
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
    const result = await updateCategoryUseCase(id, body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof CategoryNotFoundError) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      if (
        err instanceof ParentCategoryNotFoundError ||
        err instanceof CategoryCycleDetectedError
      ) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          400,
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

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "delete",
    path: "/{id}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      204: {
        description: "product deleted",
      },
      404: {
        description: "product not found",
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
    const result = await deleteProductUseCase(id);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof ProductNotFound) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      logger.error("Error deleting product: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: "unexpected",
        },
        500,
      );
    }

    return ctx.body(null, 204);
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
    console.log("at least got here");
    const { id } = ctx.req.valid("param");
    console.log("got id", id);
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

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "delete",
    path: "/variants/{id}",
    middleware: [
      authzMiddleware(true),
      checkPolicyMiddleware(["write:products"]),
    ],
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      204: {
        description: "product variant deleted",
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
    const result = await deleteProductVariantUseCase(id);

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

      logger.error("Error deleting product variant: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: "unexpected",
        },
        500,
      );
    }

    return ctx.body(null, 204);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "put",
    path: "/product-variant/{id}",
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
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
      200: {
        description: "updated product and variant",
        content: {
          "application/json": {
            schema: CreateProductAndVariantResponseDto,
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
      409: {
        description: "ingredient validation error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      400: {
        description: "invalid ingredient quantity",
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
    const result = await updateProductAndVariantUseCase(id, body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      if (err instanceof UpdateProductVariantNotFound) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      if (err instanceof UpdateAddedProductDoesNotExist) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof UpdateAddedProductIsNotIngredient) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof UpdateIngredientsOnlyForCompleteProduct) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof UpdateIncompatibleIngredientFlavor) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          409,
        );
      }

      if (err instanceof UpdateInvalidIngredientQuantity) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          400,
        );
      }

      logger.error("Error updating product and variant: %s", err);

      return ctx.json(
        {
          code: "unexpected",
          message: "unexpected",
        },
        500,
      );
    }

    return ctx.json(result.unwrap(), 200);
  },
);

productRouter.openapi(
  createRoute({
    tags: ["Products"],
    method: "get",
    path: "/ingredients",
    responses: {
      200: {
        description: "ingredient tree organized by categories",
        content: {
          "application/json": {
            schema: GetIngredientsDto,
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
    const result = await getIngredientsUseCase();

    if (result.isErr()) {
      const err = result.unwrapErr();

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
