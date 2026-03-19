import { and } from "drizzle-orm";
import type { Product, ProductFilters } from "@/domain/entities/product";
import type { Executor } from "@/infrastructure/db/postgres";
import { productTable } from "@/infrastructure/db/schema";
import { buildFilters } from "@/lib/filters";
import type { InferInsertModel } from "drizzle-orm";

type SaveProductType = Omit<
  InferInsertModel<typeof productTable>,
  "id" | "createdAt"
>;

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

  async saveProduct(data: SaveProductType) {
    const [product] = await this.conn
      .insert(productTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new product, it should always exist
    return product!;
  }

  async existsProduct(name: string) {
    const product = await this.conn.query.productTable.findFirst({
      where: {
        name,
      },
    });
    return !!product;
  }

}
