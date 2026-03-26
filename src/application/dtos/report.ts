import { z } from "@hono/zod-openapi";

export const WeeklyOrderSchema = z.object({
  day: z.string(),
  total: z.number(),
});

export const TopProductSchema = z.object({
  productName: z.string(),
  quantity: z.number(),
});

export const CategoryConsumptionSchema = z.object({
  category: z.string(),
  total: z.number(),
});

export const ReportsDto = z.object({
  weeklyOrders: z.array(WeeklyOrderSchema),
  topProducts: z.array(TopProductSchema),
  categoryConsumption: z.array(CategoryConsumptionSchema),
});

export type WeeklyOrder = z.infer<typeof WeeklyOrderSchema>;
export type TopProduct = z.infer<typeof TopProductSchema>;
export type CategoryConsumption = z.infer<typeof CategoryConsumptionSchema>;
export type Reports = z.infer<typeof ReportsDto>;
