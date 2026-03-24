import { Err, Ok, type Result } from "oxide.ts";
import type { TokenPayloadType } from "@/application/dtos/authentication";
import {
  ForbiddenError,
  RoleNotFoundError,
  UserNotFoundError,
} from "@/domain/entities/authentication";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type {
  AssignRoleDtoType,
  AssignRoleResponseDtoType,
} from "../dtos/assign-role";

export type AssignRoleError =
  | ForbiddenError
  | RoleNotFoundError
  | UserNotFoundError;

export async function assignRoleUseCase(
  actor: TokenPayloadType,
  userId: string,
  data: AssignRoleDtoType,
): Promise<Result<AssignRoleResponseDtoType, AssignRoleError>> {
  if (actor.role !== "administrator") {
    throw new ForbiddenError();
  }

  return DB.transaction(async (txn) => {
    try {
      const rbacRepo = new RbacRepo(txn);
      const userRepo = new UserRepo(txn);

      const role = await rbacRepo.findRoleByName(data.role);
      if (!role) {
        throw new RoleNotFoundError();
      }

      const user = await userRepo.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      await rbacRepo.deleteAllUserRoles(userId);
      await rbacRepo.assignRoleToUser(userId, role.id);

      return Ok({
        userId,
        role: data.role,
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
