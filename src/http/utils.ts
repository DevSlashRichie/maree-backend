import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { State } from "./state";

export function createRouter() {
  return new OpenAPIHono<State>({
    defaultHook: (result) => {
      if (!result.success) {
        const err = new HTTPException(400, {
          message: result.error.message,
          cause: result.error,
        });
        throw err;
      }
    },
  });
}
