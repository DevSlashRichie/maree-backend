import { Err, Ok, type Result } from "oxide.ts";
import { encrypt } from "paseto-ts/v4";
import type { z } from "zod";
import type { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import {
  InvalidCredentialsError,
  LoginError,
  NotImplementedLoginMethodError,
  RepositoryError,
} from "@/domain/entities/authentication";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function loginUserUseCase(
  data: z.infer<typeof LoginSchema>,
  encryptKey: string,
): Promise<Result<z.infer<typeof TokenSchema>, LoginError>> {
  try {
    const userRepo = new UserRepo(DB);

    if (data.method.type === "phone") {
      throw new NotImplementedLoginMethodError();
    }

    const user = await userRepo.findByIdentity(data.identity.value);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const userWithPassword = await userRepo.findByIdWithPassword(user.id);

    const passwordHash = userWithPassword?.userPasswordTable?.password;

    if (!passwordHash) {
      throw new InvalidCredentialsError();
    }

    const isValid = await Bun.password.verify(data.method.value, passwordHash);

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const token = encrypt(encryptKey, { userId: user.id });

    return Ok({ token });
  } catch (error) {
    if (error instanceof LoginError) {
      return Err(error);
    }

    return Err(
      new RepositoryError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
