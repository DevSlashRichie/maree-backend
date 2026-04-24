import {
  and,
  desc,
  eq,
  type InferInsertModel,
  inArray,
  sql,
} from "drizzle-orm";
import type {
  ProductVariantFilters,
  ProductVariantWithProduct,
} from "@/application/dtos/product-variant";
import type { Product, ProductFilters } from "@/domain/entities/product";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  categoryTable,
  productComponentsTable,
  productTable,
  productVariantsTable,
} from "@/infrastructure/db/schema";

import { buildFilters } from "@/lib/filters";

type SaveProductType = Omit<
  InferInsertModel<typeof productTable>,
  "id" | "createdAt"
>;

type SaveProductVariantType = Omit<
  InferInsertModel<typeof productVariantsTable>,
  "id" | "createdAt"
>;

type SaveProductComponentsType = Omit<
  InferInsertModel<typeof productComponentsTable>,
  "id" | "createdAt"
>;

export type ProductVariantSnapshot = {
  id: string;
  name: string;
  price: bigint;
  productId: string;
  productName: string;
  productType: "complete" | "ingredient";
};
type SaveCategoryType = Omit<
  InferInsertModel<typeof categoryTable>,
  "id" | "createdAt"
>;

type UpdateCategoryType = Partial<SaveCategoryType>;

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

  async findIngredientsWithVariantPrice() {
    return this.conn
      .select({
        id: productTable.id,
        name: productTable.name,
        status: productTable.status,
        image: productTable.image,
        categoryId: productTable.categoryId,
        price: sql<bigint | null>`min(${productVariantsTable.price})`,
      })
      .from(productTable)
      .leftJoin(
        productVariantsTable,
        eq(productVariantsTable.productId, productTable.id),
      )
      .where(eq(productTable.type, "ingredient"))
      .groupBy(
        productTable.id,
        productTable.name,
        productTable.status,
        productTable.image,
        productTable.categoryId,
      );
  }

  async findById(id: string) {
    const product = await this.conn.query.productTable.findFirst({
      where: {
        id,
      },
    });

    return product;
  }

  async isIngredientFromCategory(id: string) {
    const res = await this.conn.execute(sql`
      WITH RECURSIVE category_path AS (
        SELECT id, name, parent_id
        FROM category
        WHERE id = ${id}

        UNION ALL

        SELECT c.id, c.name, c.parent_id
        FROM category c
               INNER JOIN category_path cp ON c.id = cp.parent_id
      )
      SELECT name AS "rootName"
      FROM category_path
      WHERE parent_id IS NULL;
    `);

    const rootName = String(res.rows[0]?.rootName ?? "")
      .trim()
      .toLowerCase();

    return rootName === "ingrediente";
  }

  async isIngredientFromType(id: string) {
    const [res] = await this.conn
      .select()
      .from(productTable)
      .where(and(eq(productTable.id, id), eq(productTable.type, "ingredient")));

    return !!res;
  }

  async saveProduct(data: SaveProductType) {
    const [product] = await this.conn
      .insert(productTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new product, it should always exist
    return product!;
  }

  async updateProductImage(productId: string, imageUrl: string) {
    const [product] = await this.conn
      .update(productTable)
      .set({ image: imageUrl })
      .where(eq(productTable.id, productId))
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

  async existsProductById(id: string) {
    const product = await this.conn.query.productTable.findFirst({
      where: {
        id,
      },
    });
    return !!product;
  }

  async existsProductVariant(name: string) {
    const productVariant = await this.conn.query.productVariantsTable.findFirst(
      {
        where: {
          name,
        },
      },
    );
    return !!productVariant;
  }

  async saveProductVariant(data: SaveProductVariantType) {
    const [productVariant] = await this.conn
      .insert(productVariantsTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new product, it should always exist
    return productVariant!;
  }

  async saveProductComponents(data: SaveProductComponentsType[]) {
    return this.conn.insert(productComponentsTable).values(data).returning();
  }

  async getAllCategories() {
    return this.conn
      .select()
      .from(categoryTable)
      .orderBy(desc(categoryTable.createdAt));
  }

  async findCategoryById(id: string) {
    const category = await this.conn.query.categoryTable.findFirst({
      where: {
        id,
      },
    });

    return category;
  }

  async findCategoryByName(name: string) {
    const category = await this.conn.query.categoryTable.findFirst({
      where: {
        name,
      },
    });

    return category;
  }

  async saveCategory(data: SaveCategoryType) {
    const [category] = await this.conn
      .insert(categoryTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new category, it should always exist
    return category!;
  }

  async updateCategory(id: string, data: UpdateCategoryType) {
    const [category] = await this.conn
      .update(categoryTable)
      .set(data)
      .where(eq(categoryTable.id, id))
      .returning();

    return category;
  }

  async findProductVariantSnapshotsByIds(
    variantIds: string[],
  ): Promise<ProductVariantSnapshot[]> {
    if (variantIds.length === 0) {
      return [];
    }

    return this.conn
      .select({
        id: productVariantsTable.id,
        name: productVariantsTable.name,
        price: productVariantsTable.price,
        productId: productTable.id,
        productName: productTable.name,
        productType: productTable.type,
      })
      .from(productVariantsTable)
      .innerJoin(
        productTable,
        eq(productVariantsTable.productId, productTable.id),
      )
      .where(inArray(productVariantsTable.id, variantIds));
  }

  async findProductVariantWithComponents(variantId: string) {
    const variantWithProduct = await this.conn
      .select({
        variantId: productVariantsTable.id,
        variantName: productVariantsTable.name,
        variantPrice: productVariantsTable.price,
        variantImage: productVariantsTable.image,
        variantCreatedAt: productVariantsTable.createdAt,
        productId: productTable.id,
        productCategoryId: productTable.categoryId,
        productStatus: productTable.status,
        productType: productTable.type,
        productDescription: productVariantsTable.description,
      })
      .from(productVariantsTable)
      .innerJoin(
        productTable,
        eq(productVariantsTable.productId, productTable.id),
      )
      .where(eq(productVariantsTable.id, variantId));

    if (!variantWithProduct || variantWithProduct.length === 0) {
      return null;
    }

    const result = variantWithProduct[0];

    if (!result) {
      return null;
    }

    const components = await this.conn
      .select({
        id: productComponentsTable.id,
        productId: productComponentsTable.productId,
        productName: productTable.name,
        quantity: productComponentsTable.quantity,
        isRemovable: productComponentsTable.isRemovable,
      })
      .from(productComponentsTable)
      .leftJoin(
        productTable,
        eq(productComponentsTable.productId, productTable.id),
      )
      .where(eq(productComponentsTable.productVariantId, variantId));

    return {
      variant: {
        id: result.variantId,
        name: result.variantName,
        price: result.variantPrice,
        image: result.variantImage,
        productId: result.productId,
        createdAt: result.variantCreatedAt,
        description: result.productDescription,
      },
      product: {
        id: result.productId,
        categoryId: result.productCategoryId,
        status: result.productStatus,
        type: result.productType,
      },
      components,
    };
  }
}
