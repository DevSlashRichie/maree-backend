import type { User } from "@/domain/entities/user";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getUserUseCase(userId: string): Promise<User | null> {
  const user = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);

    return userRepo.findById(userId);
  });

  return user || null;
}
