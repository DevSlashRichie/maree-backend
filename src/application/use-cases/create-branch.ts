import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { CreateBranchDto } from "@/application/dtos/create-branch";
import { UnknownError } from "@/application/error";
import {
  AlreadyExistsBranch,
  CreateBranchError,
} from "@/application/errors/create-branch";
import type { BranchType } from "@/domain/entities/branch";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function createBranchUseCase(
  data: z.infer<typeof CreateBranchDto>,
): Promise<Result<BranchType, CreateBranchError>> {
  try {
    const branchRepo = new BranchRepo(DB);

    if (await branchRepo.existsBranch(data.name)) {
      throw new AlreadyExistsBranch();
    }

    const branch = await branchRepo.saveBranch(data);

    return Ok(branch);
  } catch (error) {
    if (error instanceof CreateBranchError) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
