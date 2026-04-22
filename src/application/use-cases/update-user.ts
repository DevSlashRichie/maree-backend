import type { z } from "zod";
import type { UpdateUserDto } from "@/application/dtos/user";
import { UserNotFoundError } from "@/application/errors/rbac";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { getActorUseCase } from "./get-actor";

export async function updateUserUseCase(
  userId: string,
  data: z.infer<typeof UpdateUserDto>,
) {
  const userRepo = new UserRepo(DB);
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new UserNotFoundError();
  }

  await userRepo.updateUser(userId, data);

  return getActorUseCase(userId);
}
