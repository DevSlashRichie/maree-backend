import type { ActorType } from "@/domain/entities/actor";
import { UserRepo } from "@/domain/repositories/user-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getStaffByIdUseCase(
  userId: string,
): Promise<ActorType | null> {
  const staff = await DB.transaction(async (txn) => {
    const userRepo = new UserRepo(txn);
    return userRepo.findStaffById(userId);
  });

  if (!staff) {
    return null;
  }

  const role = staff.roleName ?? null;

  return {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    phone: staff.phone,
    email: staff.email,
    createdAt: staff.createdAt,
    role,
  } as ActorType;
}
