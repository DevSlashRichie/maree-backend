import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { markOrderReadyDto } from "@/application/dtos/order.ts";
import { UnknownError } from "@/application/error.ts";
import {
  OrderAlreadyPending,
  OrderAlreadyProcessing,
  OrderError,
  OrderNotFound,
} from "@/application/errors/order.ts";
import type { OrderType } from "@/domain/entities/order.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

/**
 * Marks an order as "processing".
 *
 * @async
 * @function markOrderProcessingUseCase
 *
 * @param {z.infer<typeof markOrderReadyDto>} data - Input DTO containing the order ID.
 *
 * @returns {Promise<Result<OrderType, OrderError>>}
 * A Result type:
 * - Ok<OrderType> when the order is successfully updated to processing
 * - Err<OrderError> when a domain or unexpected error occurs
 *
 * @throws {OrderNotFound}        When the order does not exist
 * @throws {OrderAlreadyProcessing} When the order is already in processing state
 * @throws {UnknownError}         When an unexpected error occurs
 *
 * @description
 * This use case:
 * 1. Starts a database transaction
 * 2. Retrieves the order by ID
 * 3. Validates business rules (existence and status)
 * 4. Updates the order status to "processing"
 * 5. Wraps the result in a functional Result type
 */
export async function markOrderProcessingUseCase(
  data: z.infer<typeof markOrderReadyDto>,
): Promise<Result<OrderType, OrderError>> {
  // Execute all operations inside a DB transaction to ensure atomicity
  return DB.transaction(async (txn) => {
    try {
      // Initialize repository with transaction scope
      const orderRepo = new OrderRepo(txn);

      // Fetch the order by ID
      const order = await orderRepo.findById(data.id);

      // Business rule: order must exist
      if (!order) {
        throw new OrderNotFound();
      }

      // Business rule: prevent invalid state transition
      // (Note: This condition seems inverted — review logic if needed)
      if (order.status === "processing") {
        throw new OrderAlreadyProcessing();
      }

      // Update order status to "processing"
      const processingOrder = await orderRepo.orderProcessing(data.id);

      // Return success result
      return Ok(processingOrder);
    } catch (error) {
      // Handle known domain errors explicitly
      if (error instanceof OrderError) {
        return Err(error);
      }

      // Wrap unknown errors into a consistent application error
      return Err(
        new UnknownError(
          error instanceof Error ? error.message : "unknown error",
        ),
      );
    }
  });
}
