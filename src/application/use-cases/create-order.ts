import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { CreateOrderDto } from "@/application/dtos/create-order.ts";
import {
  CreateOrderError,
  ModifierMustBeIngredientError,
  ProductVariantNotFoundError,
  TotalMismatchError,
  UnknownCreateOrderError,
} from "@/application/errors/create-order.ts";
import type { Order } from "@/domain/entities/order.ts";
import { OrderRepo } from "@/domain/repositories/order-repo.ts";
import { ProductRepo } from "@/domain/repositories/product-repo.ts";
import { DB } from "@/infrastructure/db/postgres.ts";

export async function createOrderUseCase(
  userId: string,
  data: z.infer<typeof CreateOrderDto>,
): Promise<Result<Order, CreateOrderError>> {
  try {
    return await DB.transaction(async (txn) => {
      const orderRepo = new OrderRepo(txn);
      const productRepo = new ProductRepo(txn);

      const requestedVariantIds = data.items.flatMap((item) => [
        item.id,
        ...item.modifiers.map((modifier) => modifier.id),
      ]);

      const uniqueVariantIds = requestedVariantIds.filter(
        (variantId, index, arr) => arr.indexOf(variantId) === index,
      );

      const variantSnapshots =
        await productRepo.findProductVariantSnapshotsByIds([
          ...uniqueVariantIds,
        ]);

      const variantsById = new Map(
        variantSnapshots.map((snapshot) => [snapshot.id, snapshot]),
      );

      for (const variantId of requestedVariantIds) {
        if (!variantsById.has(variantId)) {
          throw new ProductVariantNotFoundError(variantId);
        }
      }

      let total = 0n;
      for (const item of data.items) {
        const itemVariant = variantsById.get(item.id);
        if (!itemVariant) {
          throw new ProductVariantNotFoundError(item.id);
        }

        total += itemVariant.price * BigInt(item.quantity);

        for (const modifier of item.modifiers) {

          const modifierVariant = variantsById.get(modifier.id);
          if (!modifierVariant) {
            throw new ProductVariantNotFoundError(modifier.id);
          }

          if (modifierVariant.productType !== "ingredient") {
            throw new ModifierMustBeIngredientError(modifier.id);
          }


          if (modifier.build_your_own) {
            continue;
          }

          total += modifierVariant.price * BigInt(modifier.delta);
        }
      }

      if (total !== BigInt(data.totalPriceCents)) {
        throw new TotalMismatchError();
      }

      const note = data.items
        .flatMap((item) => {
          const itemNote = item.notes?.trim();
          if (!itemNote) {
            return [];
          }

          const itemVariant = variantsById.get(item.id);
          if (!itemVariant) {
            throw new ProductVariantNotFoundError(item.id);
          }

          return [`${itemVariant.productName}: ${itemNote}`];
        })
        .join("\n");

      const order = await orderRepo.saveOrder({
        userId,
        branchId: data.branchId,
        discountId: data.discountId ?? null,
        total,
        status: "incoming",
        note: note.length > 0 ? note : null,
        orderNumber: crypto.randomUUID(),
      });

      await orderRepo.saveOrderItems(
        data.items.map((item) => {
          const itemVariant = variantsById.get(item.id);
          if (!itemVariant) {
            throw new ProductVariantNotFoundError(item.id);
          }

          return {
            orderId: order.id,
            variantId: item.id,
            quantity: item.quantity,
            pricingSnapshot: itemVariant.price,
            notes: item.notes?.trim() ? item.notes.trim() : null,
          };
        }),
      );

      return Ok(order);
    });
  } catch (error) {
    if (error instanceof CreateOrderError) {
      return Err(error);
    }

    return Err(
      new UnknownCreateOrderError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
