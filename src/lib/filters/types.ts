import { z } from "zod";

export const FilterOperators = {
  eq: "eq",
  lt: "lt",
  lte: "lte",
  gt: "gt",
  gte: "gte",
  contains: "contains",
  startsWith: "startsWith",
  endsWith: "endsWith",
  in: "in",
} as const;

export type FilterOperator =
  (typeof FilterOperators)[keyof typeof FilterOperators];

export const StringFilterSchema = z
  .object({
    eq: z.string(),
  })
  .or(
    z.object({
      contains: z.string(),
    }),
  )
  .or(
    z.object({
      startsWith: z.string(),
    }),
  )
  .or(
    z.object({
      endsWith: z.string(),
    }),
  )
  .or(
    z.object({
      in: z.string().transform((v) => v.split(",").filter(Boolean)),
    }),
  );

export const NumberFilterSchema = z
  .object({
    eq: z.string().transform(Number),
  })
  .or(
    z.object({
      lt: z.string().transform(Number),
    }),
  )
  .or(
    z.object({
      lte: z.string().transform(Number),
    }),
  )
  .or(
    z.object({
      gt: z.string().transform(Number),
    }),
  )
  .or(
    z.object({
      gte: z.string().transform(Number),
    }),
  );

export const UuidFilterSchema = z
  .object({
    eq: z.uuid(),
  })
  .or(
    z.object({
      in: z.string().transform((v) => v.split(",").filter(Boolean)),
    }),
  );

export const DateFilterSchema = z
  .object({
    eq: z.string().datetime(),
  })
  .or(
    z.object({
      lt: z.string().datetime(),
    }),
  )
  .or(
    z.object({
      lte: z.string().datetime(),
    }),
  )
  .or(
    z.object({
      gt: z.string().datetime(),
    }),
  )
  .or(
    z.object({
      gte: z.string().datetime(),
    }),
  );

export type StringFilter = z.infer<typeof StringFilterSchema>;
export type NumberFilter = z.infer<typeof NumberFilterSchema>;
export type UuidFilter = z.infer<typeof UuidFilterSchema>;
export type DateFilter = z.infer<typeof DateFilterSchema>;

export type ParsedFilter<T> = T extends z.ZodType<infer U> ? U : never;

export const FiltersSchema = z.record(z.string(), z.unknown());
