import type { Option } from "oxide.ts";
import type { Actor } from "@/domain/entities/actor";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getActorUseCase(userId: string): Promise<Option<Actor>> {
  const userRepo = new UserRepo(DB);
  const userWithActor = await userRepo.findByIdWithRole(userId);

  return userWithActor.map(
    (actor) =>
      ({
        id: actor.id,
        firstName: actor.firstName,
        role: actor.roles?.name,
      }) as Actor,
  );
}
