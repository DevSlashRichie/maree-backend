import { z } from "@hono/zod-openapi";

export const GoogleWalletPassDto = z.object({
    saveURL: z.string().url(),
    signedJWT: z.string(),
}).openapi("GoogleWalletPass")