import { Err, Ok, type Result } from "oxide.ts";
import {
  type ForbiddenError,
  UserNotFoundError,
} from "@/application/errors/rbac";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export type DeleteStaffError = ForbiddenError | UserNotFoundError;

export async function deleteStaffUseCase(
  userId: string,
): Promise<Result<{ userId: string }, DeleteStaffError>> {
  return DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    const rbacRepo = new RbacRepo(txn);

    const user = await userRepo.findById(userId);

    if (!user) {
      return Err(new UserNotFoundError());
    }

    // Delete from staff table
    await userRepo.deleteStaff(userId);

    // Delete all user roles related to it
    await rbacRepo.deleteAllUserRoles(userId);

    return Ok({ userId });
  });
}
