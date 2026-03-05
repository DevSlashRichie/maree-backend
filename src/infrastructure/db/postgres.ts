import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import { Option } from "oxide.ts";
import { z } from "zod";
import { relations } from "./relations";
import * as schema from "./schema";

export const envDatabaseSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  DB_PASSWORD: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_DATABASE: z.string().min(1),
});

export const DB = drizzle({
  connection: {
    host: Option.from(process.env.DB_HOST).unwrap(),
    port: Number(process.env.DB_PORT),
    password: Option.from(process.env.DB_PASSWORD).unwrap(),
    user: Option.from(process.env.DB_USERNAME).unwrap(),
    database: Option.from(process.env.DB_DATABASE).unwrap(),
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
          productVariantsTable: [
            {
              count: [3, 6],
              weight: 1,
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
            values: ["burgers", "pizzas", "drinks", "desserts", "sides"],
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
        },
      },
      productVariantsTable: {
        count: 35,
        columns: {
          name: funcs.valuesFromArray({
            values: ["Small", "Medium", "Large", "Regular"],
          }),
          price: funcs.int({ minValue: 5000, maxValue: 20000 }),
          image: funcs.string({}),
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
    }));
  }
}
