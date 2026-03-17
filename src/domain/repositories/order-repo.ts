import { and } from "drizzle-orm";
import type { Order, OrderFilters } from "@/domain/entities/order.ts";
import type { Executor } from "@/infrastructure/db/postgres.ts";
import { ordersTable } from "@/infrastructure/db/schema";
import { buildFilters } from "@/lib/filters";

export class OrderRepo {
  constructor(private readonly conn: Executor) {}

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, ordersTable)
      : [];

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const orders = await this.conn
      .select()
      .from(ordersTable)
      .where(whereClause);

    return orders;
  }
}
