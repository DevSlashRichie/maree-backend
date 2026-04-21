import { OrderRepo } from "@/domain/repositories/order-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getUserOrdersUseCase(userId: string) {
  const orderRepo = new OrderRepo(DB);
  return await orderRepo.findAllByUserId(userId);
}
