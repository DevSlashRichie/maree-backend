import { RegisterReviewDto } from "@/domain/dtos/register-review";
import { ReviewSchema } from "@/domain/entities/review";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorSchema } from "@/domain/entities/error";
import type { State } from "../state";
import { registerReviewUseCase } from "@/application/use-cases/register-review";
import { logger } from "@/lib/logger";


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
