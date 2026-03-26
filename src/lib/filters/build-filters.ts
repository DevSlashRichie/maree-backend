import { eq, gt, gte, inArray, like, lt, lte, type SQL } from "drizzle-orm";
import {
  DateFilterSchema,
  NumberFilterSchema,
  StringFilterSchema,
  UuidFilterSchema,
} from "./types";

function isStringFilter(
  // biome-ignore lint/suspicious/noExplicitAny: filter type
  value: any,
): value is {
  eq?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  in?: string[];
} {
  return (
    typeof value === "object" &&
    value !== null &&
    ("eq" in value ||
      "contains" in value ||
      "startsWith" in value ||
      "endsWith" in value ||
      "in" in value)
  );
}

function isNumberFilter(value: unknown): value is {
  eq?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    ("eq" in value ||
      "lt" in value ||
      "lte" in value ||
      "gt" in value ||
      "gte" in value)
  );
}

function isUuidFilter(
  // biome-ignore lint/suspicious/noExplicitAny: filter type
  value: any,
): value is { eq?: string; in?: string[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    ("eq" in value || "in" in value)
  );
}

function isDateFilter(value: unknown): value is {
  eq?: string;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    ("eq" in value ||
      "lt" in value ||
      "lte" in value ||
      "gt" in value ||
      "gte" in value)
  );
}

export function buildFilters(
  filters: Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle table columns
  table: { [key: string]: any },
): SQL[] {
  const conditions: SQL[] = [];

  for (const [fieldName, filterValue] of Object.entries(filters)) {
    const column = table[fieldName];
    if (!column) continue;
    if (typeof filterValue !== "object" || filterValue === null) continue;

    if (isStringFilter(filterValue)) {
      const parsed = StringFilterSchema.safeParse(filterValue);
      if (!parsed.success) continue;

      const f = parsed.data;
      if ("eq" in f && f.eq !== undefined) {
        conditions.push(eq(column, f.eq));
      } else if ("contains" in f && f.contains !== undefined) {
        conditions.push(like(column, `%${f.contains}%`));
      } else if ("startsWith" in f && f.startsWith !== undefined) {
        conditions.push(like(column, `${f.startsWith}%`));
      } else if ("endsWith" in f && f.endsWith !== undefined) {
        conditions.push(like(column, `%${f.endsWith}`));
      } else if ("in" in f && f.in !== undefined) {
        conditions.push(inArray(column, f.in));
      }
    } else if (isNumberFilter(filterValue)) {
      const parsed = NumberFilterSchema.safeParse(filterValue);
      if (!parsed.success) continue;

      const f = parsed.data;
      if ("eq" in f && f.eq !== undefined) {
        conditions.push(eq(column, f.eq));
      } else if ("lt" in f && f.lt !== undefined) {
        conditions.push(lt(column, f.lt));
      } else if ("lte" in f && f.lte !== undefined) {
        conditions.push(lte(column, f.lte));
      } else if ("gt" in f && f.gt !== undefined) {
        conditions.push(gt(column, f.gt));
      } else if ("gte" in f && f.gte !== undefined) {
        conditions.push(gte(column, f.gte));
      }
    } else if (isUuidFilter(filterValue)) {
      const parsed = UuidFilterSchema.safeParse(filterValue);
      if (!parsed.success) continue;

      const f = parsed.data;
      if ("eq" in f && f.eq !== undefined) {
        conditions.push(eq(column, f.eq));
      } else if ("in" in f && f.in !== undefined) {
        conditions.push(inArray(column, f.in));
      }
    } else if (isDateFilter(filterValue)) {
      const parsed = DateFilterSchema.safeParse(filterValue);
      if (!parsed.success) continue;

      const f = parsed.data;
      if ("eq" in f && f.eq !== undefined) {
        conditions.push(eq(column, new Date(f.eq)));
      } else if ("lt" in f && f.lt !== undefined) {
        conditions.push(lt(column, new Date(f.lt)));
      } else if ("lte" in f && f.lte !== undefined) {
        conditions.push(lte(column, new Date(f.lte)));
      } else if ("gt" in f && f.gt !== undefined) {
        conditions.push(gt(column, new Date(f.gt)));
      } else if ("gte" in f && f.gte !== undefined) {
        conditions.push(gte(column, new Date(f.gte)));
      }
    }
  }

  return conditions;
}
