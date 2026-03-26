import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { readdirSync } from "fs";
import path from "path";

const schemaFiles = readdirSync("./src/infrastructure/db/schema")
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .map((f) => path.join("./src/infrastructure/db/schema", f));

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/infrastructure/db/schema/index.ts",
  dialect: "postgresql",
  verbose: true,
  casing: "snake_case",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    password: process.env.DB_PASSWORD!,
    user: process.env.DB_USERNAME!,
    database: process.env.DB_DATABASE!,
    ssl: process.env.NODE_ENV === "production",
  },
});
