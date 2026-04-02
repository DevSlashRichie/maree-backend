import { z } from "@hono/zod-openapi";
import { StringFilterSchema, UuidFilterSchema } from "@/lib/filters";

export const UserFiltersSchema = z.object({
  id: UuidFilterSchema.optional(),
  firstName: StringFilterSchema.optional(),
  lastName: StringFilterSchema.optional(),
  phone: StringFilterSchema.optional(),
  email: StringFilterSchema.optional(),
  createdAt: StringFilterSchema.optional(),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;

export const StaffFiltersSchema = UserFiltersSchema.extend({
  branchId: UuidFilterSchema.optional(),
});

export type StaffFilters = z.infer<typeof StaffFiltersSchema>;
