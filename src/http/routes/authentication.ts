import { Hono } from "hono";
import { getUserUseCase } from "@/application/use-cases/get-user";

export const authenticationRouter = new Hono();

authenticationRouter.get("/me", async (ctx) => {
  // get middleware to get the user, for now well mock it.

  // this will fail for now
  // @ts-ignore - for mock
  const actor = ctx.get("actor") as unknown as {
    id: string;
  };

  const user = await getUserUseCase(actor.id);

  return ctx.json(user);
});
