import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import {
  OrderError,
  OrderInvalidTransition,
  OrderNotFound,
} from "@/application/errors/order";
import type { OrderType } from "@/domain/entities/order";
import { OrderRepo } from "@/domain/repositories/order-repo";
import type { OrderStatus } from "@/domain/value-objects/order-status";
import { DB } from "@/infrastructure/db/postgres";

const TRANSITIONS: Record<string, Record<string, OrderStatus>> = {
  forward: {
    pending: "incoming",
    incoming: "set",
    set: "complete",
    complete: "ready",
    ready: "complete",
  },
  backward: {
    incoming: "pending",
    set: "incoming",
    complete: "set",
    ready: "complete",
  },
};

export async function updateOrderStatusUseCase(
  id: string,
  action: "forward" | "backward",
): Promise<Result<OrderType, OrderError>> {
  try {
    const orderRepo = new OrderRepo(DB);

    const order = await orderRepo.findById(id);

    if (!order) {
      throw new OrderNotFound();
    }

    const nextStatus = TRANSITIONS[action]?.[order.status];

    if (!nextStatus) {
      throw new OrderInvalidTransition(order.status, action);
    }

    const updatedOrder = await orderRepo.updateStatus(id, nextStatus);

    return Ok(updatedOrder);
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
}
