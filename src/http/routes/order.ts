import { createRoute, z } from "@hono/zod-openapi";
import qs from "qs";
import { CreateOrderDto } from "@/application/dtos/create-order.ts";
import {
  DetailedOrderDto,
  IncomingOrdersDto,
  OrderHistoryDto,
} from "@/application/dtos/order.ts";
import {
  ModifierMustBeIngredientError,
  ProductVariantNotFoundError,
  TotalMismatchError,
} from "@/application/errors/create-order.ts";
import {
  OrderAlreadyClosed,
  OrderAlreadyMark,
  OrderInvalidTransition,
  OrderNotFound,
} from "@/application/errors/order";
import { ForbiddenError } from "@/application/errors/rbac";
import { closeOrderUseCase } from "@/application/use-cases/close-order";
import { createOrderUseCase } from "@/application/use-cases/create-order.ts";
import { getIncomingOrdersUseCase } from "@/application/use-cases/get-incoming-orders.ts";
import { getOderHistoryUseCase } from "@/application/use-cases/get-oder-history.ts";
import { getOrderDetailUseCase } from "@/application/use-cases/get-order-detail";
import { getOrdersUseCase } from "@/application/use-cases/get-orders.ts";
import { getUserOrdersUseCase } from "@/application/use-cases/get-user-orders";
import { markOrderReadyUseCase } from "@/application/use-cases/mark-order-ready";
import { updateOrderStatusUseCase } from "@/application/use-cases/update-order-status";
import { ErrorSchema } from "@/domain/entities/error.ts";
import {
  OrderFilterSchema,
  OrderSchema,
  OrderWithUserSchema,
} from "@/domain/entities/order";
import { logger } from "@/lib/logger.ts";
import { authzMiddleware } from "../middleware/authz";
import { createRouter } from "../utils";

export const orderRouter = createRouter();

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(true)],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateOrderDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "order created",
        content: {
          "application/json": {
            schema: OrderSchema,
          },
        },
      },
      400: {
        description: "invalid order payload",
        content: {
          "application/json": {
            schema: ErrorSchema,
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
    const body = ctx.req.valid("json");
    const actor = ctx.get("actor");

    const result = await createOrderUseCase(actor.userId, body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      const statusCode =
        err instanceof TotalMismatchError ||
        err instanceof ModifierMustBeIngredientError
          ? 400
          : err instanceof ProductVariantNotFoundError
            ? 404
            : 500;

      logger.warn("Error in post: (%s) %s", err.code, err.message);

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        statusCode,
      );
    }

    return ctx.json(result.unwrap(), 201);
  },
);

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
    const id = ctx.get("actor").userId;
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
    path: "/@me",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(true)],
    responses: {
      200: {
        description: "user order history",
        content: {
          "application/json": {
            schema: z.array(OrderSchema),
          },
        },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    const orders = await getUserOrdersUseCase(actor.userId);
    return ctx.json(orders, 200);
  },
);

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "get",
    path: "/@me/{id}",
    security: [{ Bearer: [] }],
    middleware: [authzMiddleware(true)],
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "order details with items",
        content: {
          "application/json": {
            schema: DetailedOrderDto,
          },
        },
      },
      403: {
        description: "forbidden - not your order",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "order not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
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
    const actor = ctx.get("actor");
    const { id } = ctx.req.valid("param");

    const result = await getOrderDetailUseCase(id, actor.userId);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err instanceof ForbiddenError) {
        return ctx.json({ code: err.code, message: err.message }, 403);
      }
      if (err instanceof OrderNotFound) {
        return ctx.json({ code: err.code, message: err.message }, 404);
      }
      return ctx.json({ code: "internal_error", message: err.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "patch",
    path: "/{id}/close",
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
    path: "/{id}/ready",
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

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "orders with user",
        content: {
          "application/json": {
            schema: OrderWithUserSchema.array(),
          },
        },
      },
      400: {
        description: "invaliid filter",
        content: {
          "application/json": {
            schema: ErrorSchema,
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
    const queryString = ctx.req.query();
    const parsedQuery = qs.parse(queryString);

    const filterValidation =
      await OrderFilterSchema.safeParseAsync(parsedQuery);

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

    const orders = await getOrdersUseCase(hasFilters ? filters : undefined);

    if (orders.isErr()) {
      const err = orders.unwrapErr();

      logger.warn("Failed login: (%s) %s", err.code, err.message);

      return ctx.json(
        {
          code: err.code,
          message: err.message,
        },
        500,
      );
    }

    return ctx.json(orders.unwrap(), 200);
  },
);

orderRouter.openapi(
  createRoute({
    tags: ["Order"],
    method: "patch",
    path: "/{id}/status",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              action: z.enum(["forward", "backward"]),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Order status updated",
        content: { "application/json": { schema: OrderSchema } },
      },
      404: {
        description: "Order not found",
        content: { "application/json": { schema: ErrorSchema } },
      },
      422: {
        description: "Invalid transition",
        content: { "application/json": { schema: ErrorSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  async (ctx) => {
    const { id } = ctx.req.valid("param");
    const { action } = ctx.req.valid("json");

    const result = await updateOrderStatusUseCase(id, action);

    if (result.isErr()) {
      const err = result.unwrapErr();
      const statusCode =
        err instanceof OrderNotFound
          ? 404
          : err instanceof OrderInvalidTransition
            ? 422
            : 500;

      return ctx.json({ code: err.code, message: err.message }, statusCode);
    }

    return ctx.json(result.unwrap(), 200);
  },
);
