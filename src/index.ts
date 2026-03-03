import "dotenv/config";
import { createHttpServer, envHttpConf } from "./http";
import { DB, envDatabaseSchema } from "./repository/postgres";

async function main() {
  const parsed = await envDatabaseSchema.safeParseAsync(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedHttpConf = await envHttpConf.safeParseAsync(process.env);

  if (!parsedHttpConf.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsedHttpConf.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  createHttpServer(parsedHttpConf.data);

  console.log("Server ready!");
}

await main();
