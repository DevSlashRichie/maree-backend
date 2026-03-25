import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  RedeemResultSchema,
  RedeemRewardSchema,
  RedemptionHistoryItemSchema,
} from "@/application/dtos/reward";
import { getRedemptionHistoryUseCase } from "@/application/use-cases/get-redemption-history";
import {
  getAvailableRewardUseCase,
  getRewardsUseCase,
} from "@/application/use-cases/get-rewards";
import {
  InsufficientPointsError,
  LoyaltyCardNotFoundError,
  RewardNotFoundError,
} from "@/application/errors/redeem-reward";
import { getRedemptionHistoryUseCase } from "@/application/use-cases/get-redemption-history";
import { getRewardsUseCase } from "@/application/use-cases/get-rewards";
import { redeemRewardUseCase } from "@/application/use-cases/redeem-reward";
import { ErrorSchema } from "@/domain/entities/error";
import { RewardSchema } from "@/domain/entities/reward";
import type { State } from "../state";

export const rewardRouter = new OpenAPIHono<State>();

rewardRouter.openapi(
  createRoute({
    tags: ["Reward"],
    method: "get",
    path: "/",
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
    method: "get",
    path: "/available",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "list available rewards for the authenticated user",
        content: {
          "application/json": {
            schema: z.array(RewardSchema),
          },
        },
      },
      500: {
        description: "unexpected error",
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
    const result = await getAvailableRewardUseCase({ userId: actor.userId });
    if (result.isErr()) {
      return ctx.json(
        { code: "UNKNOWN_ERROR", message: "unexpected error" },
        500,
      );
    }
    return ctx.json(result.unwrap(), 200);
  },
);
