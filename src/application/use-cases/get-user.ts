import { eq } from "drizzle-orm";
import type { User } from "@/domain/entities/user";
import { DB } from "@/infrastructure/db/postgres";
import { userTable } from "@/infrastructure/db/schema";

export async function getUserUseCase(userId: string): Promise<User | null> {
  const user = await DB.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  return user ?? null;
}
