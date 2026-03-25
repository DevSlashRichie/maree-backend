import { z } from "@hono/zod-openapi";

export const AssignRoleDto = z
  .object({
    role: z.string().min(1),
  })
  .openapi("AssignRoleRequest");

export const AssignRoleResponseDto = z
  .object({
    userId: z.string().uuid(),
    role: z.string(),
  })
  .openapi("AssignRoleResponse");

export type AssignRoleDtoType = z.infer<typeof AssignRoleDto>;
export type AssignRoleResponseDtoType = z.infer<typeof AssignRoleResponseDto>;
