import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import { Option } from "oxide.ts";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { relations } from "./relations";
import * as schema from "./schema";

const {
  categoryTable,
  productTable,
  productVariantsTable,
  productComponentsTable,
} = schema;

type CategorySeed = {
  key: string;
  name: string;
  parentKey?: string;
};

type ProductSeed = {
  key: string;
  name: string;
  categoryKey: string;
  type: "complete" | "ingredient";
  price: bigint;
  components?: Array<{
    productKey: string;
    quantity: number;
    isRemovable: boolean;
  }>;
};

const crepeStoreCategories: CategorySeed[] = [
  { key: "crepa", name: "Crepa" },
  { key: "crepa-dulce", name: "Dulce", parentKey: "crepa" },
  { key: "crepa-salada", name: "Salada", parentKey: "crepa" },
  {
    key: "crepa-dulce-artesanal",
    name: "Artesanal",
    parentKey: "crepa-dulce",
  },
  {
    key: "crepa-dulce-especial",
    name: "Especial",
    parentKey: "crepa-dulce",
  },
  {
    key: "crepa-dulce-custom",
    name: "Custom",
    parentKey: "crepa-dulce",
  },
  {
    key: "crepa-salada-custom",
    name: "Custom",
    parentKey: "crepa-salada",
  },
  { key: "waffle", name: "Waffle" },
  { key: "waffle-artesanal", name: "Artesanal", parentKey: "waffle" },
  { key: "waffle-especial", name: "Especial", parentKey: "waffle" },
  { key: "bebida", name: "Bebida" },
  { key: "bebida-caliente", name: "Caliente", parentKey: "bebida" },
  { key: "bebida-fria", name: "Fría", parentKey: "bebida" },
  { key: "ingrediente", name: "Ingrediente" },
  { key: "ingrediente-dulce", name: "Dulce", parentKey: "ingrediente" },
  {
    key: "ingrediente-dulce-topping",
    name: "Topping",
    parentKey: "ingrediente-dulce",
  },
  {
    key: "ingrediente-dulce-untable",
    name: "Untable",
    parentKey: "ingrediente-dulce",
  },
  {
    key: "ingrediente-dulce-fruta",
    name: "Fruta",
    parentKey: "ingrediente-dulce",
  },
  { key: "ingrediente-salada", name: "Salada", parentKey: "ingrediente" },
  {
    key: "ingrediente-salada-topping",
    name: "Topping",
    parentKey: "ingrediente-salada",
  },
  {
    key: "ingrediente-salada-untable",
    name: "Untable",
    parentKey: "ingrediente-salada",
  },
  {
    key: "ingrediente-salada-fruta",
    name: "Fruta",
    parentKey: "ingrediente-salada",
  },
];

const crepeStoreProducts: ProductSeed[] = [
  {
    key: "chocolate",
    name: "Chocolate",
    categoryKey: "ingrediente-dulce-topping",
    type: "ingredient",
    price: BigInt(1200),
  },
  {
    key: "coco-rallado",
    name: "Coco rallado",
    categoryKey: "ingrediente-dulce-topping",
    type: "ingredient",
    price: BigInt(1000),
  },
  {
    key: "nutella",
    name: "Nutella",
    categoryKey: "ingrediente-dulce-untable",
    type: "ingredient",
    price: BigInt(1800),
  },
  {
    key: "cajeta",
    name: "Cajeta",
    categoryKey: "ingrediente-dulce-untable",
    type: "ingredient",
    price: BigInt(1700),
  },
  {
    key: "fresa",
    name: "Fresa",
    categoryKey: "ingrediente-dulce-fruta",
    type: "ingredient",
    price: BigInt(1400),
  },
  {
    key: "platano",
    name: "Plátano",
    categoryKey: "ingrediente-dulce-fruta",
    type: "ingredient",
    price: BigInt(1300),
  },
  {
    key: "limon",
    name: "Limón",
    categoryKey: "ingrediente-dulce-fruta",
    type: "ingredient",
    price: BigInt(1100),
  },
  {
    key: "jamon",
    name: "Jamón",
    categoryKey: "ingrediente-salada-topping",
    type: "ingredient",
    price: BigInt(1500),
  },
  {
    key: "queso-oaxaca",
    name: "Queso Oaxaca",
    categoryKey: "ingrediente-salada-topping",
    type: "ingredient",
    price: BigInt(1600),
  },
  {
    key: "pollo-deshebrado",
    name: "Pollo deshebrado",
    categoryKey: "ingrediente-salada-topping",
    type: "ingredient",
    price: BigInt(1900),
  },
  {
    key: "mayonesa-chipotle",
    name: "Mayonesa chipotle",
    categoryKey: "ingrediente-salada-untable",
    type: "ingredient",
    price: BigInt(900),
  },
  {
    key: "aguacate",
    name: "Aguacate",
    categoryKey: "ingrediente-salada-fruta",
    type: "ingredient",
    price: BigInt(1500),
  },
  {
    key: "jitomate",
    name: "Jitomate",
    categoryKey: "ingrediente-salada-fruta",
    type: "ingredient",
    price: BigInt(1000),
  },
  {
    key: "crepa-nutella-fresa",
    name: "Crepa de Nutella y Fresa",
    categoryKey: "crepa-dulce-artesanal",
    type: "complete",
    price: BigInt(9500),
    components: [
      { productKey: "nutella", quantity: 1, isRemovable: true },
      { productKey: "fresa", quantity: 2, isRemovable: true },
    ],
  },
  {
    key: "crepa-cajeta-platano",
    name: "Crepa de Cajeta y Plátano",
    categoryKey: "crepa-dulce-artesanal",
    type: "complete",
    price: BigInt(9800),
    components: [
      { productKey: "cajeta", quantity: 1, isRemovable: true },
      { productKey: "platano", quantity: 2, isRemovable: true },
    ],
  },
  {
    key: "crepa-kinder",
    name: "Crepa Kinder",
    categoryKey: "crepa-dulce-especial",
    type: "complete",
    price: BigInt(10500),
    components: [
      { productKey: "chocolate", quantity: 1, isRemovable: true },
      { productKey: "nutella", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "crepa-oreo",
    name: "Crepa Oreo",
    categoryKey: "crepa-dulce-especial",
    type: "complete",
    price: BigInt(10400),
    components: [
      { productKey: "chocolate", quantity: 1, isRemovable: true },
      { productKey: "coco-rallado", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "crepa-dulce-personalizada",
    name: "Crepa Dulce Personalizada",
    categoryKey: "crepa-dulce-custom",
    type: "complete",
    price: BigInt(11200),
    components: [
      { productKey: "nutella", quantity: 1, isRemovable: true },
      { productKey: "fresa", quantity: 1, isRemovable: true },
      { productKey: "cajeta", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "crepa-jamon-queso",
    name: "Crepa de Jamón y Queso",
    categoryKey: "crepa-salada-custom",
    type: "complete",
    price: BigInt(9900),
    components: [
      { productKey: "jamon", quantity: 1, isRemovable: true },
      { productKey: "queso-oaxaca", quantity: 1, isRemovable: true },
      { productKey: "mayonesa-chipotle", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "crepa-salada-personalizada",
    name: "Crepa Salada Personalizada",
    categoryKey: "crepa-salada-custom",
    type: "complete",
    price: BigInt(11500),
    components: [
      { productKey: "pollo-deshebrado", quantity: 1, isRemovable: true },
      { productKey: "aguacate", quantity: 1, isRemovable: true },
      { productKey: "jitomate", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "waffle-clasico",
    name: "Waffle Clásico",
    categoryKey: "waffle-artesanal",
    type: "complete",
    price: BigInt(8500),
    components: [
      { productKey: "nutella", quantity: 1, isRemovable: true },
      { productKey: "fresa", quantity: 2, isRemovable: true },
    ],
  },
  {
    key: "waffle-fresa",
    name: "Waffle de Fresa",
    categoryKey: "waffle-artesanal",
    type: "complete",
    price: BigInt(8900),
    components: [
      { productKey: "fresa", quantity: 3, isRemovable: true },
      { productKey: "cajeta", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "waffle-especial-nutella",
    name: "Waffle Especial de Nutella",
    categoryKey: "waffle-especial",
    type: "complete",
    price: BigInt(9400),
    components: [
      { productKey: "nutella", quantity: 2, isRemovable: true },
      { productKey: "coco-rallado", quantity: 1, isRemovable: true },
    ],
  },
  {
    key: "chocolate-caliente",
    name: "Chocolate Caliente",
    categoryKey: "bebida-caliente",
    type: "complete",
    price: BigInt(4500),
    components: [{ productKey: "chocolate", quantity: 2, isRemovable: true }],
  },
  {
    key: "cafe-de-olla",
    name: "Café de Olla",
    categoryKey: "bebida-caliente",
    type: "complete",
    price: BigInt(4200),
  },
  {
    key: "te-helado-limon",
    name: "Té Helado de Limón",
    categoryKey: "bebida-fria",
    type: "complete",
    price: BigInt(3900),
    components: [{ productKey: "limon", quantity: 2, isRemovable: true }],
  },
];

async function seedCrepeCatalog(tx: DbExecutor | TxExecutor) {
  const categoryIdByKey = new Map<string, string>();
  for (const category of crepeStoreCategories) {
    const [insertedCategory] = await tx
      .insert(categoryTable)
      .values({
        name: category.name,
        parentId: category.parentKey
          ? categoryIdByKey.get(category.parentKey)
          : undefined,
      })
      .returning();

    if (!insertedCategory) {
      throw new Error(`Unable to insert category ${category.key}`);
    }

    categoryIdByKey.set(category.key, insertedCategory.id);
  }

  const productIdByKey = new Map<string, string>();
  for (const product of crepeStoreProducts) {
    const categoryId = categoryIdByKey.get(product.categoryKey);
    if (!categoryId) {
      throw new Error(
        `Missing category ${product.categoryKey} for ${product.key}`,
      );
    }

    const [insertedProduct] = await tx
      .insert(productTable)
      .values({
        name: product.name,
        status: "active",
        categoryId,
        type: product.type,
      })
      .returning();

    if (!insertedProduct) {
      throw new Error(`Unable to insert product ${product.key}`);
    }

    productIdByKey.set(product.key, insertedProduct.id);
  }

  const variantIdByKey = new Map<string, string>();
  for (const product of crepeStoreProducts) {
    const productId = productIdByKey.get(product.key);
    if (!productId) {
      throw new Error(`Missing product ${product.key}`);
    }

    const [insertedVariant] = await tx
      .insert(productVariantsTable)
      .values({
        name: product.name,
        description: `${product.name} (${product.type})`,
        price: product.price,
        image: null,
        productId,
      })
      .returning();

    if (!insertedVariant) {
      throw new Error(`Unable to insert variant ${product.key}`);
    }

    variantIdByKey.set(product.key, insertedVariant.id);
  }

  for (const product of crepeStoreProducts) {
    if (!product.components?.length) {
      continue;
    }

    const variantId = variantIdByKey.get(product.key);
    if (!variantId) {
      throw new Error(`Missing variant ${product.key}`);
    }

    await tx.insert(productComponentsTable).values(
      product.components.map((component) => {
        const ingredientProductId = productIdByKey.get(component.productKey);
        if (!ingredientProductId) {
          throw new Error(
            `Missing component product ${component.productKey} for ${product.key}`,
          );
        }

        return {
          productVariantId: variantId,
          productId: ingredientProductId,
          quantity: component.quantity,
          isRemovable: component.isRemovable,
        };
      }),
    );
  }
}

export const envDatabaseSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  DB_PASSWORD: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_DATABASE: z.string().min(1),
  ADMIN_PHONE: z.string().min(1).default("+525512345678"),
});

export const DB = drizzle({
  connection: {
    host: Option.from(process.env.DB_HOST).expect("You are missing DB HOST"),
    port: Number(process.env.DB_PORT),
    password: Option.from(process.env.DB_PASSWORD).unwrap(),
    user: Option.from(process.env.DB_USERNAME).unwrap(),
    database: Option.from(process.env.DB_DATABASE).unwrap(),
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
  casing: "snake_case",
  schema,
  relations,
});

export type DbExecutor = typeof DB;
export type TxExecutor = Parameters<typeof DB.transaction>[0] extends (
  tx: infer T,
  // biome-ignore lint/suspicious/noExplicitAny: needed for conditional type inference
) => any
  ? T
  : never;

export type Executor = DbExecutor | TxExecutor;

export async function seedIfRequired() {
  if (process.env.SEED !== "true") {
    return;
  }

  await reset(DB, schema);
  await seed(DB, schema, {
    count: 1,
  }).refine((funcs) => ({
    branchsTable: {
      count: 35,
      columns: {
        state: funcs.valuesFromArray({
          values: ["open", "closed"],
        }),
      },
      with: {
        schedulesTable: [
          {
            weight: 1,
            count: 1,
          },
        ],
        staffTable: [
          {
            weight: 1,
            count: 1,
          },
        ],
        ordersTable: [
          {
            weight: 1,
            count: 10,
          },
        ],
      },
    },
    schedulesTable: {
      columns: {
        timezone: funcs.valuesFromArray({ values: ["America/Mexico_city"] }),
        weekday: funcs.int({ minValue: 0, maxValue: 6 }),
      },
    },
    userTable: {
      count: 100,
      columns: {
        email: funcs.email(),
        firstName: funcs.firstName(),
        lastName: funcs.lastName(),
        phone: funcs.phoneNumber(),
      },
      with: {
        userRoleTable: [
          {
            weight: 1,
            count: 1,
          },
        ],
      },
    },
    rolesTable: {
      count: 3,
      columns: {
        name: funcs.valuesFromArray({
          values: ["admin", "manager", "staff", "waiter"],
        }),
      },
    },
    policyTable: {
      count: 20,
      columns: {
        name: funcs.valuesFromArray({
          values: [
            "read:orders",
            "write:orders",
            "read:products",
            "write:products",
            "read:branches",
            "write:branches",
            "read:staff",
            "write:staff",
            "read:schedules",
            "write:schedules",
            "read:roles",
            "write:roles",
            "read:users",
            "write:users",
            "read:categories",
            "write:categories",
            "read:discounts",
            "write:discounts",
            "read:notifications",
            "write:notifications",
          ],
        }),
      },
    },
    discountsTable: {
      count: 30,
      columns: {
        name: funcs.valuesFromArray({
          values: ["Summer Sale", "Winter Discount", "Happy Hour"],
        }),
        type: funcs.valuesFromArray({
          values: ["percentage", "fixed"],
        }),
        value: funcs.int({ minValue: 10, maxValue: 25 }),
        state: funcs.valuesFromArray({
          values: ["active", "inactive"],
        }),
        maxUses: funcs.int({ minValue: 1, maxValue: 10 }),
      },
      with: {
        discountBranchesTable: [
          {
            weight: 1,
            count: [1],
          },
        ],
      },
    },
    discountBranchesTable: {
      count: 5,
    },
    notificationTemplateTable: {
      count: 3,
      columns: {
        name: funcs.valuesFromArray({
          values: ["Order Confirmation", "Order Ready", "Promotion"],
        }),
        subject: funcs.loremIpsum({ sentencesCount: 1 }),
        body: funcs.loremIpsum({ sentencesCount: 3 }),
      },
      with: {
        notificationTable: [
          {
            count: [50, 60],
            weight: 1,
          },
        ],
      },
    },
    notificationTable: {
      count: 10,
      columns: {
        provider: funcs.valuesFromArray({
          values: ["kapso", "twillio"],
        }),
        state: funcs.valuesFromArray({
          values: ["pending", "sent", "failed"],
        }),
        body: funcs.loremIpsum({ sentencesCount: 3 }),
      },
    },
    orderItemsTable: {
      columns: {
        quantity: funcs.int({ minValue: 1, maxValue: 3 }),
        pricingSnapshot: funcs.int({ minValue: 1000, maxValue: 4000 }),
      },
    },
    ordersTable: {
      columns: {
        total: funcs.int({ minValue: 1000, maxValue: 4000 }),
        status: funcs.valuesFromArray({ values: ["incoming", "set", "ready"] }),
      },
      with: {
        orderItemsTable: [
          {
            weight: 1,
            count: 5,
          },
        ],
      },
    },
    productTable: {
      count: 5,
      columns: {
        name: funcs.valuesFromArray({
          values: [
            "Crepa Oreo",
            "Crepa Dulce",
            "Crepa de Jamón y Queso",
            "Café de Olla",
            "Té Helado de Limón",
          ],
        }),
      },
      with: {
        productVariantsTable: [
          {
            weight: 1,
            count: 1,
          },
        ],
      },
    },
    productVariantsTable: {
      count: 10,
      columns: {
        price: funcs.int({ minValue: 100, maxValue: 400 }),
      },
    },
    categoryTable: {
      count: 10,
    },
    orderItemsModifiersTable: {
      count: 0,
    },
    rewardsTable: {
      count: 2,
      columns: {
        name: funcs.valuesFromArray({
          values: ["Latte Gratis", "Descuento", "Crepa Gratis"],
        }),
        status: funcs.valuesFromArray({ values: ["active"] }),
        cost: funcs.int({ minValue: 1, maxValue: 3 }),
        description: funcs.loremIpsum({ sentencesCount: 1 }),
        deletedAt: false,
      },
    },
  }));

  await seedCrepeCatalog(DB);
}

const ROLES_TO_CREATE = [
  "administrator",
  "supervisor",
  "waiter",
  "cashier",
  "client",
] as const;

const POLICIES_TO_CREATE = [
  "read:orders",
  "write:orders",
  "read:products",
  "write:products",
  "read:branches",
  "write:branches",
  "read:staff",
  "write:staff",
  "read:schedules",
  "write:schedules",
  "read:roles",
  "write:roles",
  "read:users",
  "write:users",
  "read:categories",
  "write:categories",
  "read:discounts",
  "write:discounts",
  "read:notifications",
  "write:notifications",
  "read:reports",
  "read:rewards",
  "write:rewards",
  "write:visits",
  "manage:all",
] as const;

const ROLE_POLICY_MAPPING: Record<string, string[]> = {
  administrator: [
    "manage:all",
    "write:branches",
    "read:reports",
    "read:branches",
    "read:staff",
    "write:staff",
    "read:products",
    "write:products",
    "read:categories",
    "write:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
    "write:discounts",
    "read:roles",
    "write:roles",
    "read:users",
    "write:users",
  ],
  supervisor: [
    "read:reports",
    "read:branches",
    "write:branches",
    "read:staff",
    "write:staff",
    "read:products",
    "write:products",
    "read:categories",
    "write:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
    "write:discounts",
    "read:roles",
    "write:roles",
    "read:users",
    "write:users",
    "read:rewards",
    "write:rewards",
    "write:visits",
  ],
  manager: [
    "read:reports",
    "read:branches",
    "read:staff",
    "read:products",
    "write:products",
    "read:categories",
    "write:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
    "write:discounts",
    "read:users",
    "read:rewards",
    "write:rewards",
    "write:visits",
  ],
  cashier: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
    "write:visits",
  ],
  waiter: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
    "write:visits",
  ],
  staff: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
    "write:visits",
  ],
  manager: [
    "read:reports",
    "read:branches",
    "read:staff",
    "read:products",
    "write:products",
    "read:categories",
    "write:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
    "write:discounts",
    "read:users",
  ],
  cashier: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
    "read:discounts",
  ],
  waiter: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
  ],
  staff: [
    "read:branches",
    "read:products",
    "read:categories",
    "read:orders",
    "write:orders",
  ],
  client: ["read:products", "read:categories"],
};

export async function ensureSystemSetup() {
  const {
    rolesTable,
    policyTable,
    rolePoliciesTable,
    userTable,
    userRoleTable,
  } = schema;

  const { ADMIN_PHONE } = envDatabaseSchema.parse(process.env);

  await DB.transaction(async (txn) => {
    const existingRoles = await txn.select().from(rolesTable);
    const existingRoleNames = new Set(existingRoles.map((r) => r.name));

    for (const roleName of ROLES_TO_CREATE) {
      if (!existingRoleNames.has(roleName)) {
        await txn
          .insert(rolesTable)
          .values({ name: roleName })
          .onConflictDoNothing();
      }
    }

    const allRoles = await txn.select().from(rolesTable);
    const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));

    const existingPolicies = await txn.select().from(policyTable);
    const existingPolicyNames = new Set(existingPolicies.map((p) => p.name));

    for (const policyName of POLICIES_TO_CREATE) {
      if (!existingPolicyNames.has(policyName)) {
        await txn
          .insert(policyTable)
          .values({ name: policyName })
          .onConflictDoNothing();
      }
    }

    const allPolicies = await txn.select().from(policyTable);
    const policyMap = new Map(allPolicies.map((p) => [p.name, p.id]));

    const adminRoleId = roleMap.get("administrator");
    if (!adminRoleId) {
      throw new Error("Administrator role not found after creation");
    }

    const [existingAdmin] = await txn
      .select()
      .from(userTable)
      .where(eq(userTable.phone, ADMIN_PHONE))
      .limit(1);

    let adminUserId: string;
    if (!existingAdmin) {
      const [newAdmin] = await txn
        .insert(userTable)
        .values({
          firstName: "Admin",
          lastName: "System",
          phone: ADMIN_PHONE,
        })
        .returning();
      if (!newAdmin) {
        throw new Error("Failed to create admin user");
      }
      adminUserId = newAdmin.id;
    } else {
      adminUserId = existingAdmin.id;
    }

    const [existingAdminRole] = await txn
      .select()
      .from(userRoleTable)
      .where(
        and(
          eq(userRoleTable.userId, adminUserId),
          eq(userRoleTable.roleId, adminRoleId),
        ),
      )
      .limit(1);

    if (!existingAdminRole) {
      await txn.insert(userRoleTable).values({
        userId: adminUserId,
        roleId: adminRoleId,
      });
    }

    for (const [roleName, policyNames] of Object.entries(ROLE_POLICY_MAPPING)) {
      const roleId = roleMap.get(roleName);
      if (!roleId) continue;

      for (const policyName of policyNames) {
        const policyId = policyMap.get(policyName);
        if (!policyId) continue;

        await txn
          .insert(rolePoliciesTable)
          .values({ roleId, policyId })
          .onConflictDoNothing();
      }
    }
  });

  logger.info("System setup completed successfully");
}
