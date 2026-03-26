import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { CreateDiscountDto } from "@/application/dtos/discount";
import { UnknownError } from "@/application/error";
import { createDiscount, type Discount } from "@/domain/entities/discount";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function createDiscountUseCase(
  data: z.infer<typeof CreateDiscountDto>,
): Promise<Result<Discount, Error>> {
  try {
    const validatedData = createDiscount({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    const discountRepo = new DiscountRepo(DB);

    const discount = await discountRepo.saveDiscount(validatedData);

    if (!discount) {
      return Err(new UnknownError("Failed to create discount"));
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
