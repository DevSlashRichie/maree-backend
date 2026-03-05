import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { State } from "../state";
import { setCookie } from "hono/cookie";
import { AlreadyExistsBranch, BranchSchema } from "@/domain/entities/branch";
import { ErrorSchema } from "@/domain/entities/error";
import { createBranchUseCase } from "@/application/use-cases/create-branch";
import { logger } from "@/lib/logger";
import { CreateBranchDto } from "@/domain/dtos/create-branch";

export const branchRouter = new OpenAPIHono<State>();

branchRouter.openapi(
    createRoute({
        tags: ["Branch"],
        method: "post",
        path: "/",
        request: {
              body: {
                required: true,
                description: "branch details",
                content: {
                  "application/json": {
                    schema: CreateBranchDto,
                  },
                },
              },
            },
        responses: {
            201: {
            description: "new branch",
            content: {
                "application/json": {
                    schema: BranchSchema,
                },
            },
            },
            409: {
            description: "branch not found",
            content: {
                "application/json": {
                    schema: ErrorSchema,
                    },
                },
            },
            500: {
            description: "unexpected",
            content: {
                "application/json": {
                    schema: ErrorSchema,
                    },
                },
            }
        },
    }),

    async (ctx) => {
        const body = await ctx.req.json();
        const result = await createBranchUseCase(
            body,
        );

    if (result.isErr()) {
        const err = result.unwrapErr();
    
        if (err instanceof AlreadyExistsBranch) {
            return ctx.json(
                {
                    code: err.name,
                    message: "The name is already used",
                },
            409,
            );
        }

        logger.error("asd: %s", err);
        
        return ctx.json(
            {
                code: "unexpected",
                message: "unexpected",
            },
            500,
        );
    }
    
    return ctx.json(result.unwrap(), 201);
    },    
);