import { readFileSync } from "node:fs";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { GoogleWalletPassDto } from "@/application/dtos/google-wallet";
import { LoyaltyCardDetailsDto } from "@/application/dtos/reward";
import { LoyaltyCardNotFound } from "@/application/errors/get-loyalty-card";
import { getLoyaltyCardUseCase } from "@/application/use-cases/get-loyalty-card";
import { getLoyaltyGoogleWalletUseCase } from "@/application/use-cases/get-loyalty-google-wallet";
import { ErrorSchema } from "@/domain/entities/error";
import { GoogleWalletClient } from "@/infrastructure/google-wallet/google-wallet";
import { authzMiddleware } from "../middleware/authz";
import type { State } from "../state";

export const loyaltyRouter = new OpenAPIHono<State>();
loyaltyRouter.use(authzMiddleware(false));
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

    const keyPath = process.env.GOOGLE_WALLET_CREDENTIALS_PATH;

    if (!keyPath) {
      console.error(
        "ERROR: La variable GOOGLE_WALLET_CREDENTIALS_PATH no existe en el .env",
      );
      return ctx.json({ code: "CONFIG_ERROR", message: "Path missing" }, 500);
    }

    let credentialsStr: string;
    try {
      credentialsStr = readFileSync(keyPath, "utf8");
    } catch (_e: any) {
      console.error(
        `ERROR AL LEER: ${keyPath}. Asegúrate de que el archivo existe en la raíz.`,
      );
      return ctx.json(
        { code: "CONFIG_ERROR", message: "Key file unreadable" },
        500,
      );
    }

    const walletClient = new GoogleWalletClient(
      state.GOOGLE_WALLET_ISSUER_ID,
      state.GOOGLE_WALLET_CLASS_SUFFIX || "class_maree",
      credentialsStr,
    );

    const result = await getLoyaltyGoogleWalletUseCase(
      actor.userId,
      walletClient,
    );

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
