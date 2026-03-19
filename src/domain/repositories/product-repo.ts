import type { InferInsertModel } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres.ts";
import { productTable } from "@/infrastructure/db/schema";

type SaveProductType = Omit<
  InferInsertModel<typeof productTable>,
  "id" | "createdAt"
>;

export class ProductRepo {
  constructor(private readonly conn: Executor) {}

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
