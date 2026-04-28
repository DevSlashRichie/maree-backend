import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import { BranchDomainError, BranchNotFound } from "@/domain/entities/branch";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function updateBranchUseCase(
  id: string,
  data: {
    name?: string;
    state?: "active" | "inactive";
    schedules?: {
      weekday: number;
      fromTime: string;
      toTime: string;
      timezone: string;
    }[];
  },
  // biome-ignore lint/suspicious/noExplicitAny: drizzle inferred return type
): Promise<Result<any, BranchDomainError>> {
  try {
    const branchRepo = new BranchRepo(DB);

    const branch = await branchRepo.findById(id);

    if (!branch) {
      throw new BranchNotFound();
    }

    const updated = await branchRepo.updateBranch(id, data);

    return Ok(updated);
  } catch (error) {
    if (error instanceof BranchDomainError) {
      return Err(error);
    }

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
