import type z from "zod";
import type { Pagination, StaffFilters } from "@/application/dtos";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";
import type { StaffListSchema } from "../dtos/user";

export async function getStaffUseCase(
  filters?: StaffFilters,
  pagination?: Pagination,
): Promise<z.infer<typeof StaffListSchema>> {
  const result = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    return userRepo.findAllStaff(filters, pagination);
  });

  return result;
}
