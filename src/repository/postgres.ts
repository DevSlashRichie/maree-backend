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

export function createDatabase(connectInfo: z.infer<typeof envDatabaseSchema>) {
    const d = drizzle({
        connection: {
            host: connectInfo.DB_HOST,
            port: connectInfo.DB_PORT,
            password: connectInfo.DB_PASSWORD,
            user: connectInfo.DB_USERNAME,
            database: connectInfo.DB_DATABASE,
        },
        casing: "snake_case",
        schema,
    });

    return d;
}

