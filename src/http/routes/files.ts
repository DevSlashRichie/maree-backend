import { join } from "node:path";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import type { State } from "../state";

export const filesRouter = new OpenAPIHono<State>();

filesRouter.openapi(
  createRoute({
    method: "get",
    path: "/{fileId}",
    request: {
      params: z.object({
        fileId: z.string().openapi({
          param: {
            name: "fileId",
            in: "path",
          },
          example: "018f3b2e-7b7e-7b7e-7b7e-7b7e7b7e7b7e.png",
        }),
      }),
    },
    responses: {
      200: {
        description: "The file content",
      },
      404: {
        description: "File not found",
      },
    },
  }),
  async (c) => {
    const { fileId } = c.req.valid("param");
    const storagePath = process.env.LOCAL_STORAGE_PATH || "./uploads";
    const path = join(storagePath, fileId);
    const file = Bun.file(path);

    if (!(await file.exists())) {
      return c.json({ message: "File not found" }, 404);
    }

    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": file.type,
      },
    });
  },
);
