import { createRoute, z } from "@hono/zod-openapi";
import { ZodError } from "zod";
import {
  CreateRewardDto,
  RedeemResultSchema,
  RedeemRewardSchema,
  RedemptionHistoryItemSchema,
  UpdateRewardDto,
} from "@/application/dtos/reward";
import {
  InsufficientPointsError,
  LoyaltyCardNotFoundError,
  RewardNotFoundError,
} from "@/application/errors/redeem-reward";
import { createRewardUseCase } from "@/application/use-cases/create-reward";
import { deleteRewardUseCase } from "@/application/use-cases/delete-reward";
import { getRedemptionHistoryUseCase } from "@/application/use-cases/get-redemption-history";
import { getRewardsUseCase } from "@/application/use-cases/get-rewards";
import { redeemRewardUseCase } from "@/application/use-cases/redeem-reward";
import { updateRewardUseCase } from "@/application/use-cases/update-reward";
import { ErrorSchema } from "@/domain/entities/error";
import {
  DeleteRewardParamsSchema,
  RewardSchema,
  UpdateRewardParamsSchema,
} from "@/domain/entities/reward";
import { createRouter } from "../utils";
import { authzMiddleware } from "../middleware/authz";

export const rewardRouter = createRouter();

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateRewardDto,
          },
        },
      },
    },
    responses: {
      201: {
        description: "reward created",
        content: {
          "application/json": {
            schema: RewardSchema,
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
    },
  }),
  async (ctx) => {
    const body = ctx.req.valid("json");

    const result = await createRewardUseCase(body);

    if (result.isErr()) {
      const err = result.unwrapErr();

      // we let the error handler handle zod error.
      if (err instanceof ZodError) {
        throw err;
      }

      return ctx.json({ code: err.name, message: err.message }, 400);
    }

    return ctx.json(result.unwrap(), 201);
  },
);

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "get",
    path: "/",
    middleware: authzMiddleware(false),
    responses: {
      200: {
        description: "list all available rewards",
        content: {
          "application/json": {
            schema: z.array(RewardSchema),
          },
        },
      },
    },
  }),
  async (ctx) => {
    console.log(ctx.get("actor"));

    const rewards = await getRewardsUseCase();

    return ctx.json(rewards, 200);
  },
);

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "get",
    path: "/history",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "list user's redemption history",
        content: {
          "application/json": {
            schema: z.array(RedemptionHistoryItemSchema),
          },
        },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    const history = await getRedemptionHistoryUseCase(actor.userId);

    return ctx.json(history, 200);
  },
);

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "post",
    path: "/redeem",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: RedeemRewardSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "reward redeemed successfully",
        content: {
          "application/json": {
            schema: RedeemResultSchema,
          },
        },
      },
      400: {
        description: "error redeeming reward",
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
    const body = ctx.req.valid("json");

    try {
      const result = await redeemRewardUseCase({
        userId: actor.userId,
        rewardId: body.rewardId,
        branchId: body.branchId,
      });

      return ctx.json(result, 200);
    } catch (error) {
      if (error instanceof RewardNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 400);
      }
      if (error instanceof LoyaltyCardNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 400);
      }
      if (error instanceof InsufficientPointsError) {
        return ctx.json({ code: error.code, message: error.message }, 400);
      }
      throw error;
    }
  },
);

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "delete",
    path: "/{rewardId}",
    security: [{ Bearer: [] }],
    request: {
      params: DeleteRewardParamsSchema,
    },
    responses: {
      204: {
        description: "reward deleted successfully",
      },
      400: {
        description: "error deleting reward",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "reward not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const rewardId = ctx.req.param("rewardId");

    const result = await deleteRewardUseCase({ rewardId });

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err.code === "REWARD_NOT_FOUND") {
        return ctx.json({ code: err.code, message: err.message }, 404);
      }
      return ctx.json({ code: err.code, message: err.message }, 400);
    }

    return ctx.body(null, 204);
  },
);

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "patch",
    path: "/{rewardId}",
    security: [{ Bearer: [] }],
    request: {
      params: UpdateRewardParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: UpdateRewardDto,
          },
        },
      },
    },
    responses: {
      200: {
        description: "reward updated successfully",
        content: {
          "application/json": {
            schema: RewardSchema,
          },
        },
      },
      400: {
        description: "error updating reward",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      404: {
        description: "reward not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const rewardId = ctx.req.param("rewardId");
    const body = ctx.req.valid("json");

    const result = await updateRewardUseCase({ rewardId }, body);

    if (result.isErr()) {
      const err = result.unwrapErr();
      if (err.code === "REWARD_NOT_FOUND") {
        return ctx.json({ code: err.code, message: err.message }, 404);
      }
      return ctx.json({ code: err.code, message: err.message }, 400);
    }

    return ctx.json(result.unwrap(), 200);
  },
);
