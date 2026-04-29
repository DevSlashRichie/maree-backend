import { google } from "googleapis";
import { Err, Ok, type Result } from "oxide.ts";
import { encrypt } from "paseto-ts/v4";
import type { z } from "zod";
import type {
  LoginResultSchema,
  LoginSchema,
} from "@/application/dtos/authentication";
import {
  InvalidCredentialsError,
  LoginError,
  RepositoryError,
} from "@/application/errors/login-user";
import type { User } from "@/domain/entities/user";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import { WATwilioClient } from "@/infrastructure/wa/twilio";
import { logger } from "@/lib/logger";

const CREATED_CODES: Record<string, string> = {};

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

async function phoneMethod2(user: User, phone: string, fromPhone: string) {
  const waClient = new WATwilioClient(fromPhone);

  await waClient.sendVerificationMessage(phone, "");

  CREATED_CODES[user.id] = "remote";
}

async function _phoneMethod(user: User, phone: string, fromPhone: string) {
  const waClient = new WATwilioClient(fromPhone);

  const code = randomInt(100000, 999999);
  logger.debug("code: %s", code);
  await waClient.sendVerificationMessage(
    phone,
    //`Tu código de verificación es: ${code}`,
    `${code}`,
  );

  CREATED_CODES[user.id] = String(code);
}

async function codeMethod(user: User, code: string, fromPhone: string) {
  if (!CREATED_CODES[user.id]) {
    throw new InvalidCredentialsError();
  }

  if (CREATED_CODES[user.id] === "remote") {
    if (!user.phone) {
      throw new InvalidCredentialsError();
    }

    const waClient = new WATwilioClient(fromPhone);
    await waClient.verifyToken(user.phone, code);

    return;
  }

  if (CREATED_CODES[user.id] !== code) {
    throw new InvalidCredentialsError();
  }
}

async function testCodeMethod(user: User) {
  CREATED_CODES[user.id] = String(123456);
}

async function passwordMethod(
  user: User,
  password: string,
  userRepo: UserRepo,
) {
  const userWithPassword = await userRepo.findByIdWithPassword(user.id);

  const passwordHash = userWithPassword?.password;

  if (!passwordHash) {
    throw new InvalidCredentialsError();
  }

  const isValid = await Bun.password.verify(password, passwordHash);

  if (!isValid) {
    throw new InvalidCredentialsError();
  }
}

async function googleMethod(idToken: string) {
  const client = new google.auth.OAuth2();

  try {
    const ticket = await client.verifyIdToken({
      idToken,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new InvalidCredentialsError();
    }

    return {
      email: payload.email,
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
    };
  } catch (error) {
    logger.error(error, "google auth error");
    throw new InvalidCredentialsError();
  }
}

export async function loginUserUseCase(
  data: z.infer<typeof LoginSchema>,
  encryptKey: string,
  fromNumber: string,
): Promise<Result<z.infer<typeof LoginResultSchema>, LoginError>> {
  try {
    const userRepo = new UserRepo(DB);

    let user: User | undefined;

    if (data.method.type === "google") {
      const googleData = await googleMethod(data.method.value);
      const existingUser = await userRepo.findByIdentity(googleData.email);

      if (existingUser) {
        user = existingUser;
      } else {
        user = await userRepo.saveUser({
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
        });
      }
    } else {
      if (!data.identity) {
        throw new InvalidCredentialsError();
      }

      user = (await userRepo.findByIdentity(data.identity)) ?? undefined;

      if (!user) {
        throw new InvalidCredentialsError();
      }

      if (data.method.type === "phone") {
        if (!user.phone) {
          throw new InvalidCredentialsError();
        }

        try {
          await phoneMethod2(user, user.phone, fromNumber);
        } catch (err) {
          logger.error("PhoneMethod2 Err: %s", err);
          throw err;
        }

        return Ok({
          type: "required_action",
          required_action: "login_with_sent_code",
        });
      } else if (data.method.type === "password") {
        await passwordMethod(user, data.method.value, userRepo);
      } else if (data.method.type === "code") {
        await codeMethod(user, String(data.method.value), fromNumber);
      } else if (data.method.type === "test") {
        await testCodeMethod(user);

        return Ok({
          type: "required_action",
          required_action: "login_with_sent_code",
        });
      } else {
        throw new InvalidCredentialsError();
      }
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // do rbac stuff
    const actor = await userRepo.findByIdWithRole(user.id);

    const exp = new Date();
    // + one month
    exp.setTime(exp.getTime() + 30 * 24 * 60 * 60 * 1000);

    const token = encrypt(encryptKey, {
      userId: user.id,
      role: actor?.roleName ?? null,
      exp: exp.toISOString(),
    });

    return Ok({
      type: "token",
      token,
      expiresAt: exp.toISOString(),
      actor: {
        ...user,
        role: actor?.roleName ?? null,
      },
    });
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
