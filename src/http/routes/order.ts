import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  IncomingOrdersDto,
  OrderHistoryDto,
} from "@/application/dtos/order.ts";
import {
  OrderAlreadyClosed,
  OrderAlreadyMark,
  OrderNotFound,
} from "@/application/errors/order";
import { closeOrderUseCase } from "@/application/use-cases/close-order";
import { getIncomingOrdersUseCase } from "@/application/use-cases/get-incoming-orders.ts";
import { getOderHistoryUseCase } from "@/application/use-cases/get-oder-history.ts";
import { markOrderReadyUseCase } from "@/application/use-cases/mark-order-ready";
import { ErrorSchema } from "@/domain/entities/error.ts";
import { OrderSchema } from "@/domain/entities/order";
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
    method: "patch",
    path: "/:id/close",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Order closed successfully",
        content: {
          "application/json": {
            schema: OrderSchema,
          },
        },
      },
      404: {
        description: "Order not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      409: {
        description: "Order already closed",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
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

    const result = await closeOrderUseCase({ id });

    if (result.isErr()) {
      const err = result.unwrapErr();

      const statusCode =
        err instanceof OrderNotFound
          ? 404
          : err instanceof OrderAlreadyClosed
            ? 409
            : 500;

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        statusCode,
      );
    }

    return ctx.json(result.unwrap(), 200);
  },
);

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "patch",
    path: "/:id/ready",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Order is ready",
        content: {
          "application/json": {
            schema: OrderSchema,
          },
        },
      },
      404: {
        description: "Order not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      409: {
        description: "Order already mark",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
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

    const result = await markOrderReadyUseCase({ id });

    if (result.isErr()) {
      const err = result.unwrapErr();

      const statusCode =
        err instanceof OrderNotFound
          ? 404
          : err instanceof OrderAlreadyMark
            ? 409
            : 500;

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        statusCode,
      );
    }

    return ctx.json(result.unwrap(), 200);
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
