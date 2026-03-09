import type { Branch } from "@/domain/entities/branch";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getBranchUseCase(name: string): Promise<Branch | null> {
  const branch = await DB.transaction(async (txn) => {
    const branchRepo = new BranchRepo(txn);

    return branchRepo.findByName(name);
  });

  return branch || null;
}
