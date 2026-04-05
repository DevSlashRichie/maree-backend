import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error.ts";
import type { GetOrdersError } from "@/application/errors/get-orders.ts";
import type { OrderFilters, OrderWithUser } from "@/domain/entities/order.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function getOrdersUseCase(
  filters?: OrderFilters,
): Promise<Result<OrderWithUser[], GetOrdersError>> {
  return await DB.transaction(async (txn) => {
    try {
      const orderRepo = new OrderRepo(txn);
      const ordersWithUsers = await orderRepo.findAllWithUser(filters);

      return Ok(ordersWithUsers);
    } catch (error) {
      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
