import { Ok, type Result } from "oxide.ts";
import type { Discount } from "@/domain/entities/discount";
import { DiscountRepo } from "@/domain/repositories/discount-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function listDiscountsUseCase(): Promise<Result<Discount[], Error>> {
  const discountRepo = new DiscountRepo(DB);
  const discounts = await discountRepo.listDiscounts();
  return Ok(discounts);
}
