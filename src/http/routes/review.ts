import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { RegisterReviewDto } from "@/application/dtos/register-review";
import { registerReviewUseCase } from "@/application/use-cases/register-review";
import { ErrorSchema } from "@/domain/entities/error";
import {
  InvalidSatisfactionRateError,
  OrderNotFoundError,
  ReviewSchema,
  UserNotFoundError,
} from "@/domain/entities/review.ts";
import { logger } from "@/lib/logger";
import type { State } from "../state";
export const reviewRouter = new OpenAPIHono<State>();

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
