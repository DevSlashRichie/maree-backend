import { and, eq } from "drizzle-orm";
import {
  type Order,
  type OrderFilters,
  OrderNotFound,
  type OrderWithUser,
} from "@/domain/entities/order.ts";
import type { Executor } from "@/infrastructure/db/postgres.ts";
import { ordersTable, userTable } from "@/infrastructure/db/schema";
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

  async findAllWithUser(filters?: OrderFilters): Promise<OrderWithUser[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, ordersTable)
      : [];

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const orders = await this.conn
      .select()
      .from(ordersTable)
      .leftJoin(userTable, eq(ordersTable.userId, userTable.id));

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

  async orderReady(id: string) {
    const [order] = await this.conn
      .update(ordersTable)
      .set({ status: "ready" })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      throw new OrderNotFound();
    }

    return order;
  }
}
