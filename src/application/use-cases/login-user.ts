import { Err, Ok, type Result } from "oxide.ts";
import { encrypt } from "paseto-ts/v4";
import type { z } from "zod";
import type {
  LoginSchema,
  TokenSchema,
} from "@/application/dtos/authentication";
import {
  InvalidCredentialsError,
  RepositoryError,
  UserError,
} from "@/domain/entities/authentication";
import type { User } from "@/domain/entities/user";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { WATwilioClient } from "@/infrastructure/wa/twilio";
import { logger } from "@/lib/logger";

const CREATED_CODES: Record<string, number> = {};

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);

  const buffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buffer);
    if (buffer[0] && buffer[0] < limit) {
      return min + (buffer[0] % range);
    }
  }
}

async function phoneMethod(user: User, phone: string, fromPhone: string) {
  const waClient = new WATwilioClient(fromPhone);

  const code = randomInt(100000, 999999);
  logger.debug("code: %s", code);
  await waClient.sendTextMessage(
    phone,
    //`Tu código de verificación es: ${code}`,
    `${code}`,
  );

  CREATED_CODES[user.id] = code;
}

async function codeMethod(user: User, code: number) {
  if (!CREATED_CODES[user.id] || CREATED_CODES[user.id] !== code) {
    throw new InvalidCredentialsError();
  }
}

async function passwordMethod(
  user: User,
  password: string,
  userRepo: UserRepo,
) {
  const userWithPassword = await userRepo.findByIdWithPassword(user.id);

  const passwordHash = userWithPassword?.userPasswordTable?.password;

  if (!passwordHash) {
    throw new InvalidCredentialsError();
  }

  const isValid = await Bun.password.verify(password, passwordHash);

  if (!isValid) {
    throw new InvalidCredentialsError();
  }
}

export async function loginUserUseCase(
  data: z.infer<typeof LoginSchema>,
  encryptKey: string,
  fromNumber: string,
): Promise<Result<z.infer<typeof TokenSchema>, UserError>> {
  try {
    const userRepo = new UserRepo(DB);

    const user = await userRepo.findByIdentity(data.identity);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (data.method.type === "phone") {
      await phoneMethod(user, user.phone, fromNumber);
      return Ok({ success: true });
    } else if (data.method.type === "password") {
      await passwordMethod(user, data.method.value, userRepo);
    } else if (data.method.type === "code") {
      await codeMethod(user, data.method.value);
    }

    const token = encrypt(encryptKey, { userId: user.id });

    return Ok({ token });
  } catch (error) {
    if (error instanceof UserError) {
      return Err(error);
    }

    return Err(
      new RepositoryError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
