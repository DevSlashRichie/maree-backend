import type { BranchWithSchedules } from "@/domain/entities/branch";
import { BranchRepo } from "@/domain/repositories/branch-repo";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getBranchByIdUseCase(
  id: string,
): Promise<BranchWithSchedules | null> {
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

export async function getOpenBranchesUseCase(): Promise<BranchWithSchedules[]> {
  const branches = await DB.transaction(async (txn) => {
    const branchRepo = new BranchRepo(txn);
    return branchRepo.findAllOpen();
  });

  return branches;
}

export async function getStaffByBranchUseCase(branchId: string) {
  return DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    return userRepo.findStaffByBranch(branchId);
  });
}

export async function getRewardsByBranchUseCase(branchId: string) {
  return DB.transaction(async (txn) => {
    const discountRepo = new DiscountRepo(txn);
    return discountRepo.findByBranch(branchId);
  });
}
