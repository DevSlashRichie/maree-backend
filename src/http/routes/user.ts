import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getActorUseCase } from "@/application/use-cases/get-actor";
import { ActorSchema } from "@/domain/entities/actor";
import { UserNotFoundError } from "@/domain/entities/authentication";
import { ErrorSchema } from "@/domain/entities/error";
import type { State } from "../state";

export const userRouter = new OpenAPIHono<State>();

userRouter.get("/", (ctx) => {
  return ctx.json({});
});

userRouter.post("/", (ctx) => {
  return ctx.json({});
});

userRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/@me",
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: ActorSchema,
          },
        },
      },
      404: {
        description: "user not found",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const actor = ctx.get("actor");

    try {
      const user = await getActorUseCase(actor.userId);
      return ctx.json(user, 200);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return ctx.json({ code: error.code, message: error.message }, 404);
      }
      throw error;
    }
  },
);
