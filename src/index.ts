import { execSync } from "node:child_process";
import { createHttpServer, EnvHttpConf } from "./http";
import "dotenv/config";
import { logger } from "@/lib/logger";
import { StateEnvSchema } from "./http/state";
import {
  envDatabaseSchema,
  seedIfRequired,
} from "./infrastructure/db/postgres";
import { envKapsoSchema } from "./infrastructure/wa/kapso";
import { envTwilioSchema } from "./infrastructure/wa/twilio";
import "@/lib/bigint";

async function main() {
  const parsed = await envDatabaseSchema.safeParseAsync(process.env);

  if (!parsed.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedHttpConf = await EnvHttpConf.safeParseAsync(process.env);

  if (!parsedHttpConf.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsedHttpConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedKapsoConf = await envKapsoSchema.safeParseAsync(process.env);

  if (!parsedKapsoConf.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsedKapsoConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedTwilioConf = await envTwilioSchema.safeParseAsync(process.env);

  if (!parsedTwilioConf.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsedTwilioConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedStateConf = await StateEnvSchema.safeParseAsync(process.env);

  if (!parsedStateConf.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsedStateConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  if (process.env.NODE_ENV === "production") {
    logger.info("Running database migrations...");
    execSync("bun run drizzle:migrate", { stdio: "inherit" });
  }

  await seedIfRequired();
  createHttpServer(parsedHttpConf.data, parsedStateConf.data);

  logger.info("Server ready on port: %s", parsedHttpConf.data.PORT);
}

await main();
