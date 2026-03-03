import { Hono } from "hono";
import z from "zod";

export const envHttpConf = z.object({
    HOST: z.ipv4(),
    PORT: z.number().gt(0),
});

export function createHttpServer<T>(
    options: z.infer<typeof envHttpConf>,
) {
    const app = new Hono();

    app.post("/", (ctx) => {

        return ctx.json({});
    });

}
