import {
  and,
  desc,
  eq,
  type InferInsertModel,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type {
  ProductVariantFilters,
  ProductVariantWithProduct,
} from "@/application/dtos/product-variant";
import type { Product, ProductFilters } from "@/domain/entities/product";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  categoryTable,
  productAllowedIngredientsTable,
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

type SaveAllowedIngredientType = Omit<
  InferInsertModel<typeof productAllowedIngredientsTable>,
  "id"
>;

type UpdateCategoryType = Partial<SaveCategoryType>;

export class ProductRepo {
  constructor(private readonly conn: Executor) {}

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const whereConditions = filters
      ? buildFilters(filters as Record<string, unknown>, productTable)
      : [];

    whereConditions.push(isNull(productTable.deletedAt));

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
        id: productVariantsTable.id,
        name: productVariantsTable.name,
        status: productTable.status,
        image: productVariantsTable.image,
        categoryId: productTable.categoryId,
        price: productVariantsTable.price,
      })
      .from(productTable)
      .innerJoin(
        productVariantsTable,
        eq(productVariantsTable.productId, productTable.id),
      )
      .where(eq(productTable.type, "ingredient"));
  }

  async findById(id: string) {
    const [product] = await this.conn
      .select()
      .from(productTable)
      .where(and(eq(productTable.id, id), isNull(productTable.deletedAt)))
      .limit(1);

    return product ?? null;
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
      .from(productVariantsTable)
      .innerJoin(
        productTable,
        eq(productTable.id, productVariantsTable.productId),
      )
      .where(
        and(
          eq(productVariantsTable.id, id),
          eq(productTable.type, "ingredient"),
        ),
      );

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

  async softDelete(id: string) {
    await this.conn
      .update(productTable)
      .set({ deletedAt: new Date() })
      .where(eq(productTable.id, id));
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

    whereConditions.push(isNull(productVariantsTable.deletedAt));

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

  async updateProduct(id: string, data: Partial<SaveProductType>) {
    const [product] = await this.conn
      .update(productTable)
      .set(data)
      .where(eq(productTable.id, id))
      .returning();
    // biome-ignore lint/style/noNonNullAssertion: product must exist at this point
    return product!;
  }

  async updateProductVariant(
    id: string,
    data: Partial<SaveProductVariantType>,
  ) {
    const [variant] = await this.conn
      .update(productVariantsTable)
      .set(data)
      .where(eq(productVariantsTable.id, id))
      .returning();
    // biome-ignore lint/style/noNonNullAssertion: variant must exist at this point
    return variant!;
  }

  async deleteProductComponentsByVariantId(variantId: string) {
    await this.conn
      .delete(productComponentsTable)
      .where(eq(productComponentsTable.productVariantId, variantId));
  }

  async softDeleteVariant(id: string) {
    await this.conn
      .update(productVariantsTable)
      .set({ deletedAt: new Date() })
      .where(eq(productVariantsTable.id, id));
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

  async findProductVariant(id: string) {
    return await this.conn
      .select()
      .from(productVariantsTable)
      .innerJoin(
        productTable,
        eq(productTable.id, productVariantsTable.productId),
      )
      .where(eq(productVariantsTable.id, id))
      .limit(1);
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
      .where(
        and(
          inArray(productVariantsTable.id, variantIds),
          isNull(productVariantsTable.deletedAt),
        ),
      );
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
      .where(
        and(
          eq(productVariantsTable.id, variantId),
          isNull(productVariantsTable.deletedAt),
        ),
      );

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

  async findAllowedIngredientsForVariant(variantId: string) {
    const prod = alias(productVariantsTable, "prod");

    const query = this.conn
      .select()
      .from(productAllowedIngredientsTable)
      .innerJoin(
        productVariantsTable,
        eq(
          productVariantsTable.id,
          productAllowedIngredientsTable.productVariantId,
        ),
      )
      .innerJoin(
        prod,
        eq(prod.id, productAllowedIngredientsTable.allowedProductId),
      )
      .where(eq(productAllowedIngredientsTable.productVariantId, variantId));

    return await query;
  }

  async saveAllowedIngredient(data: SaveAllowedIngredientType) {
    const [result] = await this.conn
      .insert(productAllowedIngredientsTable)
      .values(data)
      .returning();

    // biome-ignore lint/style/noNonNullAssertion: since we're creating a new product, it should always exist
    return result!;
  }

  async deleteAllowedIngredient(id: string) {
    await this.conn
      .delete(productAllowedIngredientsTable)
      .where(eq(productAllowedIngredientsTable.id, id));
  }
}
