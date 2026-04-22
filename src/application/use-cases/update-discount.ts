import { Err, Ok, type Result } from "oxide.ts";
import type z from "zod";
import type { UpdateDiscountDto } from "@/application/dtos/discount";
import { UnknownError } from "@/application/error";
import type { Discount } from "@/domain/entities/discount";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { DB } from "@/infrastructure/db/postgres";
import { DiscountNotFoundError } from "./get-discount";

export async function updateDiscountUseCase(
  id: string,
  data: z.infer<typeof UpdateDiscountDto>,
): Promise<Result<Discount, Error>> {
  try {
    const discountRepo = new DiscountRepo(DB);

    const existing = await discountRepo.findDiscountById(id);
    if (!existing) {
      return Err(new DiscountNotFoundError(id));
    }

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const discount = await discountRepo.updateDiscount(id, updateData);

    if (!discount) {
      return Err(new UnknownError("Failed to update discount"));
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
