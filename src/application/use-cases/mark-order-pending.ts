import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { markOrderReadyDto } from "@/application/dtos/order.ts";
import {
  OrderAlreadyPending,
  OrderError,
  OrderNotFound,
} from "@/application/errors/order.ts";
import type { OrderType } from "@/domain/entities/order.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";
import { UnknownError } from "@/application/error.ts";

export async function markOrderPendingUseCase(
  data: z.infer<typeof markOrderReadyDto>,
): Promise<Result<OrderType, OrderError>> {
  return DB.transaction(async (txn) => {
    try {
      const orderRepo = new OrderRepo(txn);
      const order = await orderRepo.findById(data.id);

      if (!order) {
        throw new OrderNotFound();
      }

      if (order.status === "pending") {
        throw new OrderAlreadyPending();
      }

      const pendingOrder = await orderRepo.orderPending(data.id);
      return Ok(pendingOrder);
    } catch (error) {
      if (error instanceof OrderError) {
        return Err(error);
      }

      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
