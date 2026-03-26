import { sql } from "drizzle-orm";
import type {
  CategoryConsumption,
  TopProduct,
  WeeklyOrder,
} from "@/application/dtos/report";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  categoryTable,
  orderItemsTable,
  ordersTable,
  productTable,
  productVariantsTable,
} from "@/infrastructure/db/schema";

export class ReportRepo {
  constructor(private readonly conn: Executor) {}

  async getWeeklyOrders(): Promise<WeeklyOrder[]> {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const results = await this.conn
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${ordersTable.createdAt})`,
        total: sql<number>`SUM(${ordersTable.total})`,
      })
      .from(ordersTable)
      .groupBy(sql`EXTRACT(DOW FROM ${ordersTable.createdAt})`)
      .orderBy(sql`EXTRACT(DOW FROM ${ordersTable.createdAt})`);

    const dayMap = new Map<number, number>();
    for (const r of results) {
      const dow = Number(r.dayOfWeek);
      const mapKey = dow === 0 ? 6 : dow - 1;
      dayMap.set(mapKey, Number(r.total));
    }

    return days.map((day, index) => ({
      day,
      total: dayMap.get(index) ?? 0,
    }));
  }

  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const results = await this.conn
      .select({
        productName: productTable.name,
        quantity: sql<number>`SUM(${orderItemsTable.quantity})`,
      })
      .from(orderItemsTable)
      .innerJoin(
        productVariantsTable,
        sql`${orderItemsTable.variantId} = ${productVariantsTable.id}`,
      )
      .innerJoin(
        productTable,
        sql`${productVariantsTable.productId} = ${productTable.id}`,
      )
      .groupBy(productTable.name)
      .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
      .limit(limit);

    return results.map((r) => ({
      productName: r.productName,
      quantity: Number(r.quantity),
    }));
  }

  async getCategoryConsumption(): Promise<CategoryConsumption[]> {
    const results = await this.conn
      .select({
        category: categoryTable.name,
        total: sql<number>`SUM(${orderItemsTable.quantity})`,
      })
      .from(orderItemsTable)
      .innerJoin(
        productVariantsTable,
        sql`${orderItemsTable.variantId} = ${productVariantsTable.id}`,
      )
      .innerJoin(
        productTable,
        sql`${productVariantsTable.productId} = ${productTable.id}`,
      )
      .innerJoin(
        categoryTable,
        sql`${productTable.categoryId} = ${categoryTable.id}`,
      )
      .groupBy(categoryTable.name)
      .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`);

    return results.map((r) => ({
      category: r.category,
      total: Number(r.total),
    }));
  }
}
