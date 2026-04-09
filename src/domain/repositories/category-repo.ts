import type { Category } from "@/domain/entities/category";
import type { Executor } from "@/infrastructure/db/postgres";
import { categoryTable } from "@/infrastructure/db/schema";

export class CategoryRepo {
  constructor(private readonly conn: Executor) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.conn.select().from(categoryTable);

    return categories;
  }
}
