import { createHttpServer, envHttpConf } from "./http";
import "dotenv/config";
import { logger } from "@/lib/logger";
import { envDatabaseSchema } from "./infrastructure/db/postgres";

async function main() {
  const parsed = await envDatabaseSchema.safeParseAsync(process.env);

  if (!parsed.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedHttpConf = await envHttpConf.safeParseAsync(process.env);

  if (!parsedHttpConf.success) {
    logger.error(
      "Invalid environment variables: %o",
      parsedHttpConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  createHttpServer(parsedHttpConf.data);

  logger.info("Server ready!");
}

await main();
