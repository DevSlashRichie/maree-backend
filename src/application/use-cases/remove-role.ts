import { Err, Ok, type Result } from "oxide.ts";
import type { AssignRoleResponseDtoType } from "@/application/dtos/assign-role";
import type { TokenPayloadType } from "@/application/dtos/authentication";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/application/errors/rbac";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export type RemoveRoleError =
  | ForbiddenError
  | RoleNotFoundError
  | UserNotFoundError;

export async function removeRoleUseCase(
  actor: TokenPayloadType,
  userId: string,
  roleName: string,
): Promise<Result<AssignRoleResponseDtoType, RemoveRoleError>> {
  if (actor.role !== "administrator") {
    throw new ForbiddenError();
  }

  return DB.transaction(async (txn) => {
    try {
      const rbacRepo = new RbacRepo(txn);
      const userRepo = new UserRepo(txn);

      const role = await rbacRepo.findRoleByName(roleName);
      if (!role) {
        throw new RoleNotFoundError();
      }

      const user = await userRepo.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      await rbacRepo.deleteAllUserRoles(userId);

      return Ok({
        userId,
        role: roleName,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return Err(error);
      }
      if (error instanceof RoleNotFoundError) {
        return Err(error);
      }
      if (error instanceof UserNotFoundError) {
        return Err(error);
      }
      throw error;
    }
  });
}
