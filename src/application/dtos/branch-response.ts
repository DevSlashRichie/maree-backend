import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { discountsTable, userTable } from "@/infrastructure/db/schema";

export const BranchStaffSchema = createSelectSchema(userTable, {
  createdAt: z.string(),
})
  .pick({
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    createdAt: true,
  })
  .extend({
    role: z.string().nullable(),
  })
  .openapi("BranchStaff");

export const BranchDiscountSchema = createSelectSchema(discountsTable, {
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  value: z.number(),
}).openapi("BranchDiscount");
