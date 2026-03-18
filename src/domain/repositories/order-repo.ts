import { and, eq } from "drizzle-orm";
import {
  type Order,
  type OrderFilters,
  OrderNotFound,
} from "@/domain/entities/order.ts";
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

  async findById(id: string) {
    const order = await this.conn.query.ordersTable.findFirst({
      where: {
        id,
      },
    });

    return order ?? null;
  }

  async closeOrder(id: string) {
    const [order] = await this.conn
      .update(ordersTable)
      .set({ status: "completed" })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      throw new OrderNotFound();
    }

    return order;
  }
}
