import { Err, Ok, type Result } from "oxide.ts";
import { ApplicationError, UnknownError } from "@/application/error";
import type { LoyaltyTransactionType } from "@/domain/entities/loyalty";
import { isKnownError } from "@/domain/errors";
import { RewardsRepo } from "@/domain/repositories/rewards-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export abstract class AddVisitError extends ApplicationError { }

export class UserNotFoundError extends AddVisitError {
  readonly code = "USER_NOT_FOUND";

  constructor() {
    super("User not found");
  }
}

export class TransactionCreationError extends AddVisitError {
  readonly code = "TRANSACTION_CREATION_FAILED";

  constructor() {
    super("Failed to create loyalty transaction");
  }
}

export type AddVisitInput = {
  userId: string;
  amount: number;
};

export type AddVisitResult = {
  transaction: LoyaltyTransactionType;
  newBalance: bigint;
};

export async function addVisitUseCase(
  input: AddVisitInput,
): Promise<Result<AddVisitResult, AddVisitError | UnknownError>> {
  try {
    return await DB.transaction(async (txn) => {
      const userRepo = new UserRepo(txn);
      const rewardsRepo = new RewardsRepo(txn);

      // 1. Verify user exists
      const user = await userRepo.findById(input.userId);

      if (!user) {
        return Err(new UserNotFoundError());
      }

      // 2. Insert transaction
      const transaction = await rewardsRepo.createLoyaltyTransaction(
        input.userId,
        BigInt(input.amount),
        "earned",
      );

      if (!transaction) {
        return Err(new TransactionCreationError());
      }

      // 3. Calculate new balance
      const newBalance = await rewardsRepo.calculateLoyaltyBalance(
        input.userId,
      );

      return Ok({ transaction, newBalance });
    });
  } catch (error) {
    if (isKnownError(error)) {
      return Err(error as AddVisitError);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
