import { drizzle } from "drizzle-orm/node-postgres";
import { Option } from "oxide.ts";
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
    host: Option.from(process.env.DB_HOST).unwrap(),
    port: Number(process.env.DB_PORT),
    password: Option.from(process.env.DB_PASSWORD).unwrap(),
    user: Option.from(process.env.DB_USERNAME).unwrap(),
    database: Option.from(process.env.DB_DATABASE).unwrap(),
  },
  casing: "snake_case",
  schema: schema,
});

DB.query.userTable.findFirst({
  where: (table, { eq }) => eq(table.id, ""),
});

export type DbExecutor = typeof DB;
export type TxExecutor = Parameters<typeof DB.transaction>[0] extends (
  tx: infer T,
) => any
  ? T
  : never;

export type Executor = DbExecutor | TxExecutor;
