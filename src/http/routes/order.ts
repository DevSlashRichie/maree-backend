import { Hono } from "hono";

export const orderRouter = new Hono();

orderRouter.post("/", (ctx) => {
  return ctx.json({});
});

orderRouter.get("/", (ctx) => {
  return ctx.json({});
});
