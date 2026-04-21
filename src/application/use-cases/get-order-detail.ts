import { Err, Ok, type Result } from "oxide.ts";
import { OrderRepo } from "@/domain/repositories/order-repo";
import { DB } from "@/infrastructure/db/postgres";
import { OrderNotFound } from "@/application/errors/order";
import { ForbiddenError } from "@/application/errors/rbac";

export async function getOrderDetailUseCase(orderId: string, userId: string): Promise<Result<any, Error>> {
  const orderRepo = new OrderRepo(DB);
  const order = await orderRepo.findDetailById(orderId);

  if (!order) {
    return Err(new OrderNotFound());
  }

  if (order.userId !== userId) {
    return Err(new ForbiddenError());
  }

  return Ok(order);
}
