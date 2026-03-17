import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  IncomingOrdersDto,
  OrderHistoryDto,
} from "@/application/dtos/order.ts";
import { getIncomingOrdersUseCase } from "@/application/use-cases/get-incoming-orders.ts";
import { getOderHistoryUseCase } from "@/application/use-cases/get-oder-history.ts";
import { ErrorSchema } from "@/domain/entities/error.ts";
import type { State } from "@/http/state.ts";
import { logger } from "@/lib/logger.ts";

export const orderRouter = new OpenAPIHono<State>();

orderRouter.post("/", (ctx) => {
  return ctx.json({});
});

orderRouter.get("/", (ctx) => {
  return ctx.json({});
});

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "get",
    path: "/history",
    responses: {
      200: {
        description: "order history",
        content: {
          "application/json": {
            schema: OrderHistoryDto,
          },
        },
      },
      500: {
        description: "internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    // TODO: somehow get the user id
    const id = "idk";
    const history = await getOderHistoryUseCase(id);

    if (history.isErr()) {
      const err = history.unwrapErr();

      logger.warn("Failed login: (%s) %s", err.code, err.message);

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        500,
      );
    }

    return ctx.json(history.unwrap, 200);
  },
);

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "get",
    path: "/incoming",
    responses: {
      200: {
        description: "incoming orders",
        content: {
          "application/json": {
            schema: IncomingOrdersDto,
          },
        },
      },
      500: {
        description: "internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const incomingOrders = await getIncomingOrdersUseCase();

    if (incomingOrders.isErr()) {
      const err = incomingOrders.unwrapErr();

      logger.warn("Failed login: (%s) %s", err.code, err.message);

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        500,
      );
    }

    return ctx.json(incomingOrders.unwrap, 200);
  },
);
