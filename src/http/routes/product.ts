import { Hono } from "hono";

export const productRoutes = new Hono();

productRoutes.get("/", (ctx) => {

  return ctx.json({});
})

productRoutes.post("/", (ctx) => {

  return ctx.json({});
})
