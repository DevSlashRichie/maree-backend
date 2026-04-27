import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DB } from "@/infrastructure/db/postgres";
import { logger } from "@/lib/logger";

export abstract class DeleteBranchError extends Error {
  abstract readonly code: string;
}

export class BranchNotFoundError extends DeleteBranchError {
  readonly code = "BRANCH_NOT_FOUND";

  constructor() {
    super("Branch not found");
  }
}

export async function deleteBranchUseCase(
  id: string,
): Promise<Result<void, DeleteBranchError>> {
  try {
    return await DB.transaction(async (txn) => {
      const branchRepo = new BranchRepo(txn);

      const existingBranch = await branchRepo.findById(id);

      if (!existingBranch) {
        return Err(new BranchNotFoundError());
      }

      await branchRepo.deleteBranch(id);

      return Ok(undefined);
    });
  } catch (error) {
    logger.error("Error deleting branch: %s", error);

    if (error instanceof DeleteBranchError) {
      return Err(error);
    }

    return Err(
      new UnknownError(error instanceof Error ? error.message : String(error)),
    );
  }
}
