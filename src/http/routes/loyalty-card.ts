import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { LoyaltyCardDetailsDto } from "@/application/dtos/reward";
import { GoogleWalletPassDto } from "@/application/dtos/google-wallet";
import { LoyaltyCardNotFound } from "@/application/errors/get-loyalty-card";
import { getLoyaltyCardUseCase } from "@/application/use-cases/get-loyalty-card";
import { getLoyaltyGoogleWalletUseCase } from "@/application/use-cases/get-loyalty-google-wallet";
import { ErrorSchema } from "@/domain/entities/error";
// 1. Asegúrate de importar la clase correctamente
import { GoogleWalletClient } from "@/infrastructure/google-wallet/google-wallet"; 
import type { State } from "../state";

export const loyaltyRouter = new OpenAPIHono<State>();

/**
 * GET /
 * Returns basic loyalty card details
 */
loyaltyRouter.openapi(
  createRoute({
    tags: ["Loyalty"],
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Returns the loyalty card for the authenticated user",
        content: { "application/json": { schema: LoyaltyCardDetailsDto } },
      },
      404: {
        description: "Loyalty card not found",
        content: { "application/json": { schema: ErrorSchema } },
      },
      500: {
        description: "Unexpected error",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    const result = await getLoyaltyCardUseCase(actor.userId);

    if (result.isErr()) {
      const error = result.unwrapErr();
      if (error instanceof LoyaltyCardNotFound) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      return ctx.json({ code: error.code, message: error.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);

/**
 * GET /google-wallet
 * Generates the Google Wallet "Save" link and JWT
 */
loyaltyRouter.openapi(
  createRoute({
    tags: ["Loyalty"],
    method: "get",
    path: "/google-wallet",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Google Wallet pass JWT",
        content: { "application/json": { schema: GoogleWalletPassDto } },
      },
      404: {
        description: "User or loyalty data not found",
        content: { "application/json": { schema: ErrorSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");
    
    const state = ctx.get("state") as any; 


    const walletClient = new GoogleWalletClient(
      state.GOOGLE_WALLET_ISSUER_ID,
      "loyalty_class", 
      state.GOOGLE_WALLET_CREDENTIALS
    );

    const result = await getLoyaltyGoogleWalletUseCase(actor.userId, walletClient);

    if (result.isErr()) {
      const error = result.unwrapErr();
      if (error instanceof LoyaltyCardNotFound) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      return ctx.json({ code: error.code, message: error.message }, 500);
    }

    return ctx.json(result.unwrap(), 200);
  },
);