import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import { Option } from "oxide.ts";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { relations } from "./relations";
import * as schema from "./schema";

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

export async function runMigrationsIfRequired() { }

export async function seedIfRequired() {
  if (process.env.SEED === "true") {
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
          ordersTable: [
            {
              count: [10, 20],
              weight: 1,
            },
          ],
          userRoleTable: [
            {
              weight: 1,
              count: 1,
            },
          ],
          loyaltyTransactionsTable: [
            {
              weight: 1,
              count: 25,
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
      categoryTable: {
        count: 5,
        columns: {
          name: funcs.valuesFromArray({
            values: [
              "burgers",
              "pizzas",
              "drinks",
              "desserts",
              "sides",
              "salads",
              "sandwiches",
              "tacos",
              "seafood",
              "steaks",
              "pasta",
              "breakfast",
              "vegan",
              "kids",
              "appetizers",
            ],
          }),
          description: funcs.loremIpsum({ sentencesCount: 1 }),
        },
        with: {
          productTable: [
            {
              weight: 1,
              count: 3,
            },
          ],
        },
      },
      productTable: {
        count: 10,
        columns: {
          name: funcs.valuesFromArray({
            values: [
              "Classic Burger",
              "Cheese Burger",
              "Veggie Burger",
              "Margherita Pizza",
              "Pepperoni Pizza",
              "Cola",
              "Lemonade",
              "Chocolate Cake",
              "Ice Cream",
              "French Fries",
            ],
          }),
          status: funcs.valuesFromArray({
            values: ["active", "inactive"],
          }),
          type: funcs.valuesFromArray({
            values: ["complete", "component"],
          }),
        },
      },
      productVariantsTable: {
        count: 35,
        columns: {
          price: funcs.int({ minValue: 5000, maxValue: 20000 }),
          image: funcs.valuesFromArray({
            values: [
              "https://placehold.co/400x300?text=Burger",
              "https://placehold.co/400x300?text=Latte",
              "https://placehold.co/400x300?text=Coffee",
              "https://placehold.co/400x300?text=Capuchino",
              "https://placehold.co/400x300?text=Crepa Dulce",
              "https://placehold.co/400x300?text=Crepa con Platano",
              "https://placehold.co/400x300?text=Combucha",
              "https://placehold.co/400x300?text=Te Chai",
            ],
          }),
          description: funcs.loremIpsum({
            sentencesCount: 3,
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
          value: funcs.int({ minValue: 100, maxValue: 2000 }),
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
      ordersTable: {
        count: 60,
        columns: {
          total: funcs.int({ minValue: 1000, maxValue: 10000 }),
          status: funcs.valuesFromArray({
            values: ["pending", "processing", "completed", "cancelled"],
          }),
          note: funcs.loremIpsum({ sentencesCount: 1 }),
          orderNumber: funcs.uuid({}),
        },
        with: {
          orderItemsTable: [
            { count: [1, 3], weight: 0.5 },
            { count: [10, 15], weight: 0.5 },
          ],
        },
      },
      orderItemsTable: {
        count: 50,
        columns: {
          quantity: funcs.int({ minValue: 1, maxValue: 5 }),
          pricingSnapshot: funcs.int({ minValue: 500, maxValue: 3000 }),
          notes: funcs.loremIpsum({ sentencesCount: 1 }),
        },
      },
      reviewsTable: {
        count: 60,
        columns: {
          satisfactionRate: funcs.int({ minValue: 1, maxValue: 5 }),
          notes: funcs.loremIpsum({ sentencesCount: 1 }),
        },
      },
      loyaltyTransactionsTable: {
        count: 25,
        columns: {
          transactionType: funcs.valuesFromArray({
            values: ["earned", "redeemed"],
          }),
          value: funcs.int({ minValue: 1, maxValue: 2 }),
        },
      },
    }));
  }
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
  "manage:all",
] as const;

const ROLE_POLICY_MAPPING: Record<string, string[]> = {
  administrator: ["manage:all"],
  supervisor: [
    "read:orders",
    "write:orders",
    "read:products",
    "write:products",
    "read:users",
    "read:staff",
  ],
  waiter: ["read:orders", "write:orders", "read:products"],
  cashier: ["read:orders", "write:orders"],
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
