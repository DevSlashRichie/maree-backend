import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import type { Discount } from "@/domain/entities/discount";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { DB } from "@/infrastructure/db/postgres";

export class DiscountNotFoundError extends Error {
  constructor(id: string) {
    super(`Discount with id ${id} not found`);
    this.name = "DiscountNotFoundError";
  }
}

export async function getDiscountUseCase(
  id: string,
): Promise<Result<Discount, Error>> {
  try {
    const discountRepo = new DiscountRepo(DB);
    const discount = await discountRepo.findDiscountById(id);

    if (!discount) {
      return Err(new DiscountNotFoundError(id));
    }

    return Ok(discount);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
