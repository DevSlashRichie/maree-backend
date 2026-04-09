import { z } from "@hono/zod-openapi";

type CategoryNode = {
  id: string;
  name: string;
  children?: CategoryNode[];
};

// Define the schema with explicit depth levels for OpenAPI compatibility
const CategoryLevel3Schema = z.object({
  id: z.string(),
  name: z.string(),
});

const CategoryLevel2Schema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(CategoryLevel3Schema).optional(),
});

const CategoryLevel1Schema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(CategoryLevel2Schema).optional(),
});

const CategoryRootSchema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(CategoryLevel1Schema).optional(),
});

export const GetCategoriesDto = z.array(CategoryRootSchema);

export type CategoryTree = CategoryNode[];
