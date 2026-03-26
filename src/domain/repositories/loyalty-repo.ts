import { eq } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import { loyaltyTransactionsTable } from "@/infrastructure/db/schema";

export class LoyaltyRepo {
  constructor(private readonly conn: Executor) {}

 async findCurrentBalance(userId: string) {
  const transactions = await this.conn
  .select({
    transactionType: loyaltyTransactionsTable.transactionType,
    value: loyaltyTransactionsTable.value,
  })
  .from(loyaltyTransactionsTable)
  .where(eq(loyaltyTransactionsTable.userId, userId))
  
  const earned = transactions
  .filter(t => t.transactionType === "earned")
  .reduce((acc: number, t) => acc + Number(t.value), 0);

  const redeemed = transactions
  .filter(t => t.transactionType === "redeemed")
  .reduce((acc: number, t) => acc + Number(t.value), 0);
  
  return earned - redeemed;
  }

  

}
