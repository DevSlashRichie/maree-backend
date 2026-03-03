import { drizzle } from "drizzle-orm/node-postgres";
import { z } from "zod";
import * as schema from "./schema";

export const envDatabaseSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().transform(Number).pipe(z.number().int().positive()),
    DB_PASSWORD: z.string().min(1),
    DB_USERNAME: z.string().min(1),
    DB_DATABASE: z.string().min(1),
});

export const DB = drizzle({
    connection: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD!,
        user: process.env.DB_USERNAME!,
        database: process.env.DB_DATABASE!,
    },
    casing: "snake_case",
    schema,
});
