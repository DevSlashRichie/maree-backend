import { Err, Ok, type Result } from "oxide.ts";
import { encrypt } from "paseto-ts/v4";
import type { z } from "zod";
import { UnknownError } from "@/application/error";
import {
  RegisterUserError,
  UserAlreadyExistsError,
} from "@/application/errors/register-user";
import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { UserRepo } from "@/domain/repositories/user-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";
import type {
  RegisterUserDto,
  RegisterUserResponseDto,
} from "../dtos/register-user";
import { RoleNotFoundError } from "../errors/rbac";

export async function registerUserUseCase(
  data: z.infer<typeof RegisterUserDto>,
  encryptKey: string,
): Promise<Result<z.infer<typeof RegisterUserResponseDto>, RegisterUserError>> {
  return DB.transaction(async (txn) => {
    try {
      const userRepo = new UserRepo(txn);
      const rbacRepo = new RbacRepo(txn);

      const userAlreadyExists = await userRepo.existsUser(
        data.phone,
        data.email,
      );

      if (userAlreadyExists) {
        throw new UserAlreadyExistsError();
      }

      const user = await userRepo.saveUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      if (data.branchId) {
        const roleName = data.role ?? "waiter";

        await userRepo.saveStaff({
          userId: user.id,
          branchId: data.branchId,
          role: roleName,
        });

        const role = await rbacRepo.findRoleByName(roleName);

        if (!role) {
          throw new RoleNotFoundError();
        }

        await rbacRepo.deleteAllUserRoles(user.id);
        await rbacRepo.assignRoleToUser(user.id, role.id);
      }

      const token = encrypt(encryptKey, { userId: user.id });

      return Ok({ user, token });
    } catch (error) {
      if (error instanceof RegisterUserError) {
        return Err(error);
      }

      console.error("RAW ERROR:", error);
      console.error("ERROR TYPE:", typeof error);
      console.error(
        "ERROR KEYS:",
        error ? Object.keys(error as object) : null,
      );

      return Err(
        new UnknownError(
          error instanceof Error ? error.message : JSON.stringify(error),
        ),
      );
    }
  });
}