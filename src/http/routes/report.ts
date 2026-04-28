import { createRoute } from "@hono/zod-openapi";
import { authzMiddleware, checkPolicyMiddleware } from "../middleware/authz";
import { ReportsDto } from "@/application/dtos/report";
import { getReportsUseCase } from "@/application/use-cases/get-reports";
import { ErrorSchema } from "@/domain/entities/error";
import { createRouter } from "../utils";

export const reportRouter = createRouter();

reportRouter.openapi(
  createRoute({
    tags: ["Reports"],
    method: "get",
    path: "/",
    middleware: [authzMiddleware(true), checkPolicyMiddleware(["read:reports"])],
    responses: {
      200: {
        description: "reports data",
        content: {
          "application/json": {
            schema: ReportsDto,
          },
        },
      },
      500: {
        description: "internal server error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (ctx) => {
    const reports = await getReportsUseCase();
    return ctx.json(reports, 200);
  },
);
