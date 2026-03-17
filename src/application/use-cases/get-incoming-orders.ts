import { Err, Ok, type Result } from "oxide.ts";
import type { Order, OrderError } from "@/domain/entities/order.ts";
import { UnknownError } from "@/domain/entities/user.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function getIncomingOrdersUseCase(): Promise<
  Result<Order[], OrderError>
> {
  return await DB.transaction(async (txn) => {
    try {
      const orderRepo = new OrderRepo(txn);
      const filters = {
        status: { eq: "in-progress" },
      };
      const orders = await orderRepo.findAll(filters);
      return Ok(orders);
    } catch (error) {
      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
