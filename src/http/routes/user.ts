import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getUserUseCase } from "@/application/use-cases/get-user";
import { ErrorSchema } from "@/domain/entities/error";
import type { State } from "../state";
import { ActorSchema } from "@/domain/entities/actor";
import { getActorUseCase } from "@/application/use-cases/get-actor";

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
    const user = await getActorUseCase(actor.id);

    // TODO: move this error creation into the application layer.
    if (!user) {
      return ctx.json(
        { message: "user not found", code: "user_not_found" },
        404,
      );
    }

    return ctx.json(user, 200);
  },
);
