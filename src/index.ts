import "dotenv/config";
import { createDatabase, envDatabaseSchema } from "./repository/postgres";

async function main() {
    const parsed = await envDatabaseSchema.safeParseAsync(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables");
    }

    const database = createDatabase(parsed.data);

    console.log("✅ Database connection initialized");
}

await main();
