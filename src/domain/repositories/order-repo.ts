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

/**
 * Repository responsible for handling persistence operations
 * related to Orders.
 *
 * @class OrderRepo
 *
 * @description
 * Encapsulates all database interactions for the Order entity.
 * Uses Drizzle ORM and supports transactional execution via Executor.
 */
export class OrderRepo {
  /**
   * @param {Executor} conn - Database executor (can be a transaction or direct connection)
   */
  constructor(private readonly conn: Executor) { }

  /**
   * Retrieves all orders matching optional filters.
   *
   * @async
   * @method findAll
   *
   * @param {OrderFilters} [filters] - Optional filtering criteria
   * @returns {Promise<Order[]>} List of orders
   *
   * @description
   * Dynamically builds SQL WHERE conditions using provided filters.
   */
  async findAll(filters?: OrderFilters): Promise<Order[]> {
    // Build dynamic filter conditions if filters are provided
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, ordersTable)
      : [];

    // Combine conditions using AND if any exist
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Execute query
    const orders = await this.conn
      .select()
      .from(ordersTable)
      .where(whereClause);

    return orders;
  }

  /**
   * Retrieves all orders along with their associated user.
   *
   * @async
   * @method findAllWithUser
   *
   * @param {OrderFilters} [filters] - Optional filtering criteria
   * @returns {Promise<OrderWithUser[]>} List of orders with user data
   *
   * @description
   * Performs a LEFT JOIN between orders and users.
   */
  async findAllWithUser(filters?: OrderFilters): Promise<OrderWithUser[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, ordersTable)
      : [];

    const _whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const orders = await this.conn
      .select()
      .from(ordersTable)
      .leftJoin(userTable, eq(ordersTable.userId, userTable.id));

    // ⚠️ Missing `.where(_whereClause)` — filters are ignored
    return orders;
  }

  /**
   * Finds an order by its ID.
   *
   * @async
   * @method findById
   *
   * @param {string} id - Order identifier
   * @returns {Promise<Order | null>} The order if found, otherwise null
   */
  async findById(id: string) {
    const order = await this.conn.query.ordersTable.findFirst({
      where: {
        id,
      },
    });

    return order ?? null;
  }

  /**
   * Marks an order as completed.
   *
   * @async
   * @method closeOrder
   *
   * @param {string} id - Order identifier
   * @returns {Promise<Order>} Updated order
   *
   * @throws {OrderNotFound} If the order does not exist
   */
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

  /**
   * Marks an order as ready.
   *
   * @async
   * @method orderReady
   *
   * @param {string} id - Order identifier
   * @returns {Promise<Order>} Updated order
   *
   * @throws {OrderNotFound} If the order does not exist
   */
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

  /**
   * Marks an order as pending.
   *
   * @async
   * @method orderPending
   *
   * @param {string} id - Order identifier
   * @returns {Promise<Order>} Updated order
   *
   * @throws {OrderNotFound} If the order does not exist
   */
  async orderPending(id: string) {
    const [order] = await this.conn
      .update(ordersTable)
      .set({ status: "pending" })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      throw new OrderNotFound();
    }

    return order;
  }

  /**
   * Marks an order as processing.
   *
   * @async
   * @method orderProcessing
   *
   * @param {string} id - Order identifier
   * @returns {Promise<Order>} Updated order
   *
   * @throws {OrderNotFound} If the order does not exist
   */
  async orderProcessing(id: string) {
    const [order] = await this.conn
      .update(ordersTable)
      .set({ status: "processing" })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      throw new OrderNotFound();
    }

    return order;
  }
}
