import { z } from "@hono/zod-openapi";
import { ActorSchema } from "@/domain/entities/actor";
import { UserSchema } from "@/domain/entities/user";

export const UserWithStatsSchema = UserSchema.extend({
  totalConsumed: z.number(),
  totalVisits: z.number(),
});

export const UserListSchema = z
  .object({
    users: z.array(UserWithStatsSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  })
  .openapi("UserList");

export const StaffListSchema = z
  .object({
    users: z.array(ActorSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  })
  .openapi("StaffList");
