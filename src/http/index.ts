import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { serve } from "bun";
import z from "zod";
import { loggerMiddleware } from "./middleware/logger";
import { authenticationRouter } from "./routes/authentication";
import { orderRouter } from "./routes/order";
import { productRouter } from "./routes/product";
import { userRouter } from "./routes/user";
import { createStateMiddleware, type State } from "./state";

export const envHttpConf = z.object({
  HOST: z.ipv4(),
  PORT: z.coerce.number().gt(0),
});

// POST localhost/orders/ - crear order
// GET localhost/order/ - obtener muchas orders
// GET localhost/order/<id> - obtener una orden
// PATCH localhost/order/<id> - m,odificar una orden
export function createHttpServer(options: z.infer<typeof envHttpConf>) {
  const app = new OpenAPIHono<State>();

  app.use(
    "*",
    createStateMiddleware({
      authzSecret: "k4.local.rX9ovODAej0AQGyjW7VV+x/BHRddnURygK11d1ZMUA8=",
    }),
  );

  app.use("*", loggerMiddleware);
  //app.use("*", authzMiddleware);

  app.route("/users", userRouter);
  app.route("/products", productRouter);
  app.route("/orders", orderRouter);
  app.route("/auth", authenticationRouter);

  app.doc("/docs/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Maree Backend API",
    },
  });
  app.get(
    "/docs/scalar",
    Scalar({
      url: "/docs/openapi.json",
    }),
  );

  serve({
    fetch: app.fetch,
    hostname: options.HOST,
    port: options.PORT,
  });
}
