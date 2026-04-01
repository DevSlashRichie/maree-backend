import type { Pagination, UserFilters } from "@/application/dtos";
import { type PaginatedUsers, UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getUsersUseCase(
  filters?: UserFilters,
  pagination?: Pagination,
): Promise<PaginatedUsers> {
  const result = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    return userRepo.findAll(filters, pagination);
  });

  return result;
}
