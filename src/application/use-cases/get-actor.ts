import { UserNotFoundError } from "@/application/errors/rbac";
import type { ActorType } from "@/domain/entities/actor";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getActorUseCase(userId: string): Promise<ActorType> {
  const userRepo = new UserRepo(DB);
  const rbacRepo = new RbacRepo(DB);
  const userWithActor = await userRepo.findByIdWithRole(userId);

  if (!userWithActor) {
    throw new UserNotFoundError();
  }

  const roleName = userWithActor.roleName;
  let policies: string[] = [];

  if (roleName) {
    const _policies = await rbacRepo.findPoliciesForRole(roleName);
    policies = _policies.map((it) => it.policy.name);
  }

  return {
    id: userWithActor.id,
    email: userWithActor.email,
    phone: userWithActor.phone,
    lastName: userWithActor.lastName,
    firstName: userWithActor.firstName,
    createdAt: userWithActor.createdAt,
    role: roleName ?? null,
    policies,
  } as ActorType;
}
