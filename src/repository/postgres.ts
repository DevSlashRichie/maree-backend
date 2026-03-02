import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD,
        user: process.env.DB_USERNAME,
        database: process.env.DB_DATABASE,
        ssl: true,
    },
});
