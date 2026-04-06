import type z from "zod";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type { UserWithStatsSchema } from "../dtos/user";

export async function getUserUseCase(
  userId: string,
): Promise<z.infer<typeof UserWithStatsSchema> | null> {
  const user = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);

    return userRepo.findOneByIdWithStats(userId);
  });

  if (!user) return null;

  return {
    ...user,
    totalVisits: user.totalVisits || 0,
    totalConsumed: user.totalConsumed || 0,
  };
}
