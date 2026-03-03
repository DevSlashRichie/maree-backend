import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getUserUseCase } from "@/application/use-cases/get-user";
import { ErrorSchema } from "@/domain/entities/error";
import { UserSchema } from "@/domain/entities/user";
import type { State } from "../state";

export const authenticationRouter = new OpenAPIHono<State>();

authenticationRouter.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/@me",
    responses: {
      200: {
        description: "user profile",
        content: {
          "application/json": {
            schema: UserSchema,
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
    const user = await getUserUseCase(actor.id);

    if (user.isNone()) {
      return ctx.json({ message: "user not found" }, 404);
    }

    return ctx.json(user.unwrap(), 200);
  },
);
