import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { LoyaltyCardDetailsDto } from "@/application/dtos/reward";
import {
  LoyaltyCardNotFound,
  UnknownLoyaltyCardError,
} from "@/application/errors/get-loyalty-card";
import { getLoyaltyCardUseCase } from "@/application/use-cases/get-loyalty-card";
import { ErrorSchema } from "@/domain/entities/error";
import type { State } from "../state";

export const loyaltyRouter = new OpenAPIHono<State>();

loyaltyRouter.openapi(
  createRoute({
    tags: ["Loyalty"],
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Returns the loyalty card for the authenticated user",
        content: {
          "application/json": {
            schema: LoyaltyCardDetailsDto,
          },
        },
      },
      404: {
        description: "Loyalty card not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Unexpected error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    const result = await getLoyaltyCardUseCase(
      "bf040102-561a-4735-a970-ff5c410167ef",
    );

    if (result.isErr()) {
      const error = result.unwrapErr();
      console.error(error);
      if (error instanceof LoyaltyCardNotFound) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      return ctx.json({ code: error.code, message: error.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);
