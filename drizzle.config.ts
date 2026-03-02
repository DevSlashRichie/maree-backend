import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./migrations",
    schema: "./src/repository/schema.ts",
    dialect: "postgresql",
    verbose: true,
    dbCredentials: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT!),
        password: process.env.DB_PASSWORD!,
        user: process.env.DB_USERNAME!,
        database: process.env.DB_DATABASE!,
    },
});
