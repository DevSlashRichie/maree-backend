import { eq } from "drizzle-orm";
import type { User } from "@/domain/entities/user";
import { DB } from "@/repository/postgres";
import { userTable } from "@/repository/schema";

export async function getUserUseCase(userId: string): Promise<User | null> {
  const user = await DB.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  return user ?? null;
}
