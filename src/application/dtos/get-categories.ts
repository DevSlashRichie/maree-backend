import { z } from "@hono/zod-openapi";

type CategoryNode = {
  id: string;
  name: string;
  parentId?: string | null;
  public: boolean;
  children?: CategoryNode[];
};

// Define the schema with explicit depth levels for OpenAPI compatibility
const CategoryLevel3Schema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullish(),
  public: z.boolean(),
});

const CategoryLevel2Schema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullish(),
  public: z.boolean(),
  children: z.array(CategoryLevel3Schema).optional(),
});

const CategoryLevel1Schema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullish(),
  public: z.boolean(),
  children: z.array(CategoryLevel2Schema).optional(),
});

const CategoryRootSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullish(),
  public: z.boolean(),
  children: z.array(CategoryLevel1Schema).optional(),
});

export const GetCategoriesDto = z
  .array(CategoryRootSchema)
  .openapi("GetCategoriesDto");

export type CategoryTree = CategoryNode[];
