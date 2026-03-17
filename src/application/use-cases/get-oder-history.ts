import { Err, Ok, type Result } from "oxide.ts";
import {
  type Order,
  type OrderError,
  UnknownError,
} from "@/domain/entities/order.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function getOderHistoryUseCase(
  id: string,
): Promise<Result<Order[], OrderError>> {
  return await DB.transaction(async (txn) => {
    try {
      const orderRepo = new OrderRepo(txn);
      const filters = {
        userId: { eq: id },
        status: { eq: "completed" },
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
