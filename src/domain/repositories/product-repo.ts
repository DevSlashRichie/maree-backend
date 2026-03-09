import { and } from "drizzle-orm";
import type { Product, ProductFilters } from "@/domain/entities/product";
import type { Executor } from "@/infrastructure/db/postgres";
import { productTable } from "@/infrastructure/db/schema";
import { buildFilters } from "@/lib/filters";

export class ProductRepo {
  constructor(private readonly conn: Executor) {}

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, productTable)
      : [];

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const products = await this.conn
      .select()
      .from(productTable)
      .where(whereClause);

    return products;
  }

  async findById(id: string) {
    const product = await this.conn.query.productTable.findFirst({
      where: {
        id,
      },
    });

    return product;
  }
}
