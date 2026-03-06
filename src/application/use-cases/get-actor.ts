import { UserRepo } from "@/domain/repositories/user-repo";
import { UserNotFoundError } from "@/domain/entities/authentication";
import { DB } from "@/infrastructure/db/postgres";
import type { Actor } from "@/domain/entities/actor";

export async function getActorUseCase(userId: string): Promise<Actor> {
  const userRepo = new UserRepo(DB);
  const userWithActor = await userRepo.findByIdWithRole(userId);

  if (!userWithActor) {
    throw new UserNotFoundError();
  }

  return {
    id: userWithActor.id,
    email: userWithActor.email,
    phone: userWithActor.phone,
    lastName: userWithActor.lastName,
    firstName: userWithActor.firstName,
    createdAt: userWithActor.createdAt,
    role: userWithActor.rolesTable?.name,
  } as Actor;
}
