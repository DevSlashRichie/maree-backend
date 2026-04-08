import { and, eq, type InferInsertModel } from "drizzle-orm";
import type {
  ProductVariantFilters,
  ProductVariantWithProduct,
} from "@/application/dtos/product-variant";
import type { Product, ProductFilters } from "@/domain/entities/product";
import type { Executor } from "@/infrastructure/db/postgres";
import { productTable, productVariantsTable } from "@/infrastructure/db/schema";
import { buildFilters } from "@/lib/filters";

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

  async findAllVariants(
    filters?: ProductVariantFilters,
  ): Promise<ProductVariantWithProduct[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, productVariantsTable)
      : [];

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const variants = await this.conn
      .select({
        variant: productVariantsTable,
        product: productTable,
      })
      .from(productVariantsTable)
      .leftJoin(
        productTable,
        eq(productVariantsTable.productId, productTable.id),
      )
      .where(whereClause);

    return variants.map(({ variant, product }) => ({
      ...variant,
      // biome-ignore lint/style/noNonNullAssertion: a variant must always belong to a product
      product: product!,
    }));
  }
}
