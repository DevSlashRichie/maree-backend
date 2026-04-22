import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function deleteDiscountUseCase(
  id: string,
): Promise<Result<void, Error>> {
  try {
    const discountRepo = new DiscountRepo(DB);
    const discount = await discountRepo.deleteDiscount(id);

    return Ok(discount);
  } catch (error) {
    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
