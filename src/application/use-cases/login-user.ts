import type { LoginSchema, TokenSchema } from "@/domain/dtos/authentication";
import type { z } from "zod";
import type { UseCaseError } from "../error";
import { Err, Ok, Result } from "oxide.ts";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { encrypt } from "paseto-ts/v4";
import { logger } from "@/lib/logger";

export type LoginUserUseCaseError = UseCaseError<
  "invalid_credentials" | "not_implemented" | "repo"
>;

const InvalidCredentialsError = {
  type: "invalid_credentials",
  message: "when using login method via phone you should use ",
} as LoginUserUseCaseError;

const NotImplementedError = {
  type: "not_implemented",
  message: "not_implemented",
} as LoginUserUseCaseError;

const RepositoryError = (source: string) =>
  ({
    type: "repo",
    message: "an error ocurred with the repo: " + source,
  }) as LoginUserUseCaseError;

export async function loginUserUserCase(
  data: z.infer<typeof LoginSchema>,
  encryptKey: string,
): Promise<Result<z.infer<typeof TokenSchema>, LoginUserUseCaseError>> {
  if (data.method.type === "phone") {
    return Err(NotImplementedError);
  }

  // we infer is password flow

  const userRepo = new UserRepo(DB);

  const userId = (
    await Result.safe(userRepo.findByIdentity(data.identity.value))
  )
    .mapErr((err) => RepositoryError(err.message))
    .andThen((s) => {
      return s.okOr(InvalidCredentialsError);
    })
    .map((user) => user.id);

  if (userId.isErr()) {
    return userId;
  }

  const userWithPassword = (
    await Result.safe(userRepo.findByIdWithPassword(userId.unwrap()))
  )
    .mapErr((err) => RepositoryError(err.message))
    .andThen((value) => value.okOr(InvalidCredentialsError));

  logger.info("userWithPassword: %o", userWithPassword.unwrap());

  // verify the password with bcrypt2

  const token = encrypt(encryptKey, { userId });

  return Ok({ token });
}
