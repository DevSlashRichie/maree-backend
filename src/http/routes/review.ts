import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { registerReviewUseCase } from "@/application/use-cases/register-review";
import { RegisterReviewDto } from "@/domain/dtos/register-review";
import { ErrorSchema } from "@/domain/entities/error";
import { ReviewSchema } from "@/domain/entities/review";
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
