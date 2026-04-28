import { createRoute, z } from "@hono/zod-openapi";
import { RegisterReviewDto } from "@/application/dtos/register-review";
import { ReviewNotFoundError } from "@/application/errors/get-review";
import {
  OrderNotFoundError,
  UserNotFoundError,
} from "@/application/errors/register-review";
import { getReviewUseCase } from "@/application/use-cases/get-review";
import { registerReviewUseCase } from "@/application/use-cases/register-review";
import { ErrorSchema } from "@/domain/entities/error";
import {
  InvalidSatisfactionRateError,
  ReviewSchema,
} from "@/domain/entities/review";
import { logger } from "@/lib/logger";
import { createRouter } from "../utils";

export const reviewRouter = createRouter();

reviewRouter.openapi(
  createRoute({
    tags: ["Review"],
    method: "get",
    path: "/{orderId}",
    request: {
      params: z.object({
        orderId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "get review for order",
        content: {
          "application/json": {
            schema: ReviewSchema,
          },
        },
      },
      404: {
        description: "Review not found",
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
    const { orderId } = ctx.req.valid("param");
    const result = await getReviewUseCase(orderId);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof ReviewNotFoundError) {
        return ctx.json(
          {
            code: err.code,
            message: err.message,
          },
          404,
        );
      }

      logger.error("Unknown error fetching review: %s", err);
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

reviewRouter.openapi(
  createRoute({
    tags: ["Review"],
    method: "post",
    path: "/",
    request: {
      body: {
        required: true,
        description: "review details",
        content: {
          "application/json": {
            schema: RegisterReviewDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "register review",
        content: {
          "application/json": {
            schema: ReviewSchema,
          },
        },
      },
      400: {
        description: "Invalid rate",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      403: {
        description: "Order not found",
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
    const result = await registerReviewUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof InvalidSatisfactionRateError) {
        return ctx.json(
          {
            code: err.name,
            message: "Invalid rate",
          },
          400,
        );
      }
      if (err instanceof UserNotFoundError) {
        return ctx.json(
          {
            code: err.name,
            message: "User not found",
          },
          404,
        );
      }
      if (err instanceof OrderNotFoundError) {
        return ctx.json(
          {
            code: err.name,
            message: "User not found",
          },
          403,
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
