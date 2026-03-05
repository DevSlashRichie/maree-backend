import type { CreateBranchDto } from "@/domain/dtos/create-branch";
import { CreateBranchError } from "@/domain/entities/branch";
import z from "zod";
import { Err, Ok, type Result } from "oxide.ts";
import { DB } from "@/infrastructure/db/postgres";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { type BranchType, UnknownError, AlreadyExistsBranch } from "@/domain/entities/branch";

export async function createBranchUseCase (
    data: z.infer<typeof CreateBranchDto>
): Promise<Result<BranchType , CreateBranchError>> {
    try {
        const branchRepo = new BranchRepo(DB);

        if (await branchRepo.existsBranch(data.name)) {
            throw new AlreadyExistsBranch();
        }

        const branch = await branchRepo.saveBranch(data);

        return Ok(branch);

    } catch (error) {
        if (error instanceof CreateBranchError){
            return Err(error);
        }

        return Err(
            new UnknownError(
                error instanceof Error ? error.message : "unknown error",
            ),
        );
    }
}