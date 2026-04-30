import { Err, Ok, type Result } from "oxide.ts";
import type { z } from "zod";
import type { UpdateStaffDto } from "@/application/dtos/user";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/application/errors/rbac";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { getActorUseCase } from "./get-actor";

export type UpdateStaffError =
  | ForbiddenError
  | RoleNotFoundError
  | UserNotFoundError;

export async function updateStaffUseCase(
  userId: string,
  data: z.infer<typeof UpdateStaffDto>,
): Promise<Result<any, UpdateStaffError>> {
  return DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    const rbacRepo = new RbacRepo(txn);

    const user = await userRepo.findById(userId);
    if (!user) {
      return Err(new UserNotFoundError());
    }

    const { role: roleName, ...userData } = data;

    if (Object.keys(userData).length > 0) {
      await userRepo.updateUser(userId, userData);
    }

    if (roleName) {
      const role = await rbacRepo.findRoleByName(roleName);
      if (!role) {
        return Err(new RoleNotFoundError());
      }

      await rbacRepo.deleteAllUserRoles(userId);
      await rbacRepo.assignRoleToUser(userId, role.id);
    }

    const updatedActor = await getActorUseCase(userId);
    return Ok(updatedActor);
  });
}
