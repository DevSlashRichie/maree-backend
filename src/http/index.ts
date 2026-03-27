import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { serve } from "bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ZodError, z } from "zod";
import { loggerMiddleware } from "./middleware/logger";
import { authenticationRouter } from "./routes/authentication";
import { branchRouter } from "./routes/branch";
import { orderRouter } from "./routes/order";
import { productRouter } from "./routes/product";
import { reportRouter } from "./routes/report";
import { reviewRouter } from "./routes/review";
import { rewardRouter } from "./routes/reward";
import { userRouter } from "./routes/user";
import {
  createStateMiddleware,
  type State,
  type StateEnvSchema,
} from "./state";

export const EnvHttpConf = z.object({
  HOST: z.ipv4(),
  PORT: z.coerce.number().gt(0),
});

// POST localhost/orders/ - crear order
// GET localhost/order/ - obtener muchas orders
// GET localhost/order/<id> - obtener una orden
// PATCH localhost/order/<id> - m,odificar una orden
export function createHttpServer(
  options: z.infer<typeof EnvHttpConf>,
  stateConf: z.infer<typeof StateEnvSchema>,
) {
  const app = new OpenAPIHono<State>();

  app.use(
    "*",
    cors({
      origin: (e) => e,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
      credentials: true,
    }),
  );
  app.use("*", createStateMiddleware(stateConf));
  app.use("*", loggerMiddleware);

  app.onError((err, c) => {
    c.set("error", err);

    if (err instanceof ZodError) {
      return c.json(
        {
          name: "ZodError",
          message: "ZodError",
          body: err.issues,
        },
        400,
      );
    }

    if (err instanceof HTTPException && err.cause instanceof ZodError) {
      return c.json(
        {
          name: "ZodError",
          message: "ZodError",
          body: err.cause.issues,
        },
        400,
      );
    }

    if (
      "status" in err &&
      err.status === 400 &&
      err.message.includes("Malformed JSON")
    ) {
      return c.json(
        {
          name: "HTTPException",
          message: err.message,
          body: [],
        },
        400,
      );
    }

    return c.json({ message: "unexpected error" }, 500);
  });
  //app.use("*", authzMiddleware);

  const v1 = new OpenAPIHono<State>();

  v1.route("/users", userRouter);
  v1.route("/products", productRouter);
  v1.route("/orders", orderRouter);
  v1.route("/reports", reportRouter);
  v1.route("/rewards", rewardRouter);
  v1.route("/review", reviewRouter);
  v1.route("/branches", branchRouter);

  app.route("/auth", authenticationRouter);
  app.route("/v1", v1);

  app.doc("/docs/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Maree Backend API",
    },
    servers: [
      {
        url: "http://localhost:8383",
        description: "LOCALHOST",
      },
      {
        url: "https://maree.kindmeadow-92ce4777.centralus.azurecontainerapps.io",
        description: "PRODUCTION",
      },
    ],
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
