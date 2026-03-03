import { serve } from "bun";
import { Hono } from "hono";
import z from "zod";
import { loggerMiddleware } from "./middleware/logger";
import { orderRouter } from "./routes/order";
import { productRouter } from "./routes/product";
import { userRouter } from "./routes/user";
import { authenticationRouter } from "./routes/authentication";
import { createStateMiddleware, type State } from "./state";
import { authzMiddleware } from "./middleware/authz";

export const envHttpConf = z.object({
  HOST: z.ipv4(),
  PORT: z.coerce.number().gt(0),
});

// POST localhost/orders/ - crear order
// GET localhost/order/ - obtener muchas orders
// GET localhost/order/<id> - obtener una orden
// PATCH localhost/order/<id> - m,odificar una orden
export function createHttpServer(options: z.infer<typeof envHttpConf>) {
  const app = new Hono<State>();

  app.use(
    "*",
    createStateMiddleware({
      authzSecret: "secret",
    }),
  );

  app.use("*", loggerMiddleware);
  app.use("*", authzMiddleware);

  app.route("/users", userRouter);
  app.route("/products", productRouter);
  app.route("/orders", orderRouter);
  app.route("/auth", authenticationRouter);

  serve({
    fetch: app.fetch,
    hostname: options.HOST,
    port: options.PORT,
  });
}
