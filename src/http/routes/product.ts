import { Hono } from "hono";

export const productRouter = new Hono();

productRouter.get("/", (ctx) => {

  return ctx.json({});
});

productRouter.post("/", (ctx) => {

  return ctx.json({});
});
