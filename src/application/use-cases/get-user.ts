import type { User } from "@/domain/entities/user";
import { DB } from "@/infrastructure/db/postgres";
import { UserRepo } from "@/domain/repositories/user-repo";
import type { Option } from "oxide.ts";

export async function getUserUseCase(userId: string): Promise<Option<User>> {
  const user = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);

    return userRepo.findById(userId);
  });

  return user;
}
