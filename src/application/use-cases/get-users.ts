import type z from "zod";
import type { Pagination, UserFilters } from "@/application/dtos";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type { UserListSchema } from "../dtos/user";

export async function getUsersUseCase(
  filters?: UserFilters,
  pagination?: Pagination,
): Promise<z.infer<typeof UserListSchema>> {
  const result = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    const r = await userRepo.findAll(filters, pagination);

    return {
      users: r.users.map((user) => ({
        ...user,
        totalConsumed: user.totalConsumed || 0,
        totalVisits: user.totalVisits || 0,
      })),
      total: r.total,
      page: r.page,
      limit: r.limit,
    };
  });

  return result;
}
