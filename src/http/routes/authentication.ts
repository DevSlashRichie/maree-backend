import { Hono } from "hono";
import { getUserUseCase } from "@/application/use-cases/get-user";
import type { State } from "../state";

export const authenticationRouter = new Hono<State>();

authenticationRouter.get("/@me", async (ctx) => {
  const actor = ctx.get("actor");

  const user = await getUserUseCase(actor.id);

  return ctx.json(user);
});
