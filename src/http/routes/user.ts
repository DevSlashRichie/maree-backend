import { Hono } from "hono"

export const userRouter = new Hono();

userRouter.get("/", (ctx) => {
    return ctx.json({})
})

userRouter.post("/", (ctx) => {
    return ctx.json({});
})