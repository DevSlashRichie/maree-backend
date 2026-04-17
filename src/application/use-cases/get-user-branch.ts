import { BranchRepo } from "@/domain/repositories/branch-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type { UserBranchResponse } from "../dtos/user-branch";

export async function getUserBranchUseCase(
  userId: string,
): Promise<UserBranchResponse | null> {
  const userRepo = new UserRepo(DB);
  const staffMember = await userRepo.findStaffById(userId);

  if (!staffMember || !staffMember.branchId) {
    return null;
  }

  const branchRepo = new BranchRepo(DB);
  const branch = await branchRepo.findById(staffMember.branchId);

  if (!branch) {
    return null;
  }

  return {
    id: branch.id,
    name: branch.name,
    state: branch.state,
    createdAt: branch.createdAt.toISOString(),
  };
}
