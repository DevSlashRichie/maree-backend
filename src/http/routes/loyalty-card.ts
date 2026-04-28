import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { GoogleWalletPassDto } from "@/application/dtos/google-wallet";
import { LoyaltyCardDetailsDto } from "@/application/dtos/reward";
import { LoyaltyCardNotFound } from "@/application/errors/get-loyalty-card";
import { getLoyaltyAppleWalletUseCase } from "@/application/use-cases/get-loyalty-apple-wallet";
import { getLoyaltyCardUseCase } from "@/application/use-cases/get-loyalty-card";
import { getLoyaltyGoogleWalletUseCase } from "@/application/use-cases/get-loyalty-google-wallet";
import { ErrorSchema } from "@/domain/entities/error";
import { AppleWalletClient } from "@/infrastructure/apple-wallet/apple-wallet";
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
    const state = ctx.get("state");

    if (!state.GOOGLE_WALLET_CREDENTIALS_DECODED) {
      console.error(
        "ERROR: La variable GOOGLE_WALLET_CREDENTIALS_PATH no existe en el .env",
      );
      return ctx.json({ code: "CONFIG_ERROR", message: "Path missing" }, 500);
    }

    const credentialsStr = state.GOOGLE_WALLET_CREDENTIALS_DECODED;

    if (!state.GOOGLE_WALLET_ISSUER_ID) {
      console.error(
        "ERROR: La variable GOOGLE_WALLET_ISSUER_ID no existe en el .env",
      );
      return ctx.json({ code: "CONFIG_ERROR", message: "Path missing" }, 500);
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

/**
 * GET /apple-wallet
 * Generates and streams the Apple Wallet .pkpass loyalty card
 */
loyaltyRouter.openapi(
  createRoute({
    tags: ["Loyalty"],
    method: "get",
    path: "/apple-wallet",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Apple Wallet .pkpass loyalty card file",
        content: { "application/vnd.apple.pkpass": { schema: {} } },
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
    const state = ctx.get("state");

    const {
      APPLE_WALLET_TEAM_ID,
      APPLE_WALLET_PASS_TYPE_ID,
      APPLE_WALLET_WWDR_PEM_DECODED,
      APPLE_WALLET_CERT_PEM_DECODED,
      APPLE_WALLET_KEY_PEM_DECODED,
      APPLE_WALLET_KEY_PASSPHRASE,
    } = state;

    if (
      !APPLE_WALLET_TEAM_ID ||
      !APPLE_WALLET_PASS_TYPE_ID ||
      !APPLE_WALLET_WWDR_PEM_DECODED ||
      !APPLE_WALLET_CERT_PEM_DECODED ||
      !APPLE_WALLET_KEY_PEM_DECODED
    ) {
      return ctx.json(
        { code: "CONFIG_ERROR", message: "Apple Wallet not configured" },
        500,
      );
    }

    const walletClient = new AppleWalletClient(
      APPLE_WALLET_TEAM_ID,
      APPLE_WALLET_PASS_TYPE_ID,
      APPLE_WALLET_WWDR_PEM_DECODED,
      APPLE_WALLET_CERT_PEM_DECODED,
      APPLE_WALLET_KEY_PEM_DECODED,
      APPLE_WALLET_KEY_PASSPHRASE,
    );

    const result = await getLoyaltyAppleWalletUseCase(
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

    const pkpassBuffer = result.unwrap();

    return new Response(pkpassBuffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="maree.pkpass"',
        "Content-Length": String(pkpassBuffer.byteLength),
      },
    }) as never;
  },
);
