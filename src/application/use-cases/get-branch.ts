import type { BranchWithSchedules } from "@/domain/entities/branch";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getBranchByIdUseCase(id: string): Promise<BranchWithSchedules | null> {
  const branch = await DB.transaction(async (txn) => {
    const branchRepo = new BranchRepo(txn);
    return branchRepo.findById(id);
  });

  return branch || null;
}

export async function getBranchesUseCase(): Promise<BranchWithSchedules[]> {
  const branches = await DB.transaction(async (txn) => {
    const branchRepo = new BranchRepo(txn);
    return branchRepo.findAll();
  });

  return branches;
}