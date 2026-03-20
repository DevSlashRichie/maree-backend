import { Err, Ok, type Result } from "oxide.ts";
import { encrypt } from "paseto-ts/v4";
import type { z } from "zod";
import type {
  RegisterUserDto,
  RegisterUserResponseDto,
} from "@/application/dtos/register-user.ts";
import {
  PasswordIsRequired,
  RegisterUserError,
  UnknownError,
  UserAlreadyExistsError,
} from "@/domain/entities/user.ts";
import { UserRepo } from "@/domain/repositories/user-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function registerUserUseCase(
  data: z.infer<typeof RegisterUserDto>,
  encryptKey: string,
): Promise<Result<z.infer<typeof RegisterUserResponseDto>, RegisterUserError>> {
  return DB.transaction(async (txn) => {
    try {
      const userRepo = new UserRepo(txn);

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

      if (data.role) {
        if (!data.password) {
          throw new PasswordIsRequired();
        }

        const hashedPassword = await Bun.password.hash(data.password);
        await userRepo.savePassword({
          userId: user.id,
          password: hashedPassword,
        });
      }

      const token = encrypt(encryptKey, { userId: user.id });

      return Ok({ user, token });
    } catch (error) {
      if (error instanceof RegisterUserError) {
        return Err(error);
      }

      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
