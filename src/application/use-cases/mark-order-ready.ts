import type z from "zod";
import type { markOrderReadyDto } from "../dtos/order";
import { type OrderType, OrderError, OrderNotFound, OrderAlreadyMark, UnknownError } from "@/domain/entities/order";
import { Err, Ok, type Result } from "oxide.ts";
import { OrderRepo } from "@/domain/repositories/order-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function markOrderReadyUseCase(
    data: z.infer<typeof markOrderReadyDto>
): Promise<Result<OrderType, OrderError>> {
    try {
        const orderRepo = new OrderRepo(DB);
    
        const order = await orderRepo.findById(data.id);
    
        if (!order) {
            throw new OrderNotFound();
        }
    
        if (order.status === "ready") {
            throw new OrderAlreadyMark();
        }
    
        const closedOrder = await orderRepo.orderReady(data.id);
    
        return Ok(closedOrder);
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