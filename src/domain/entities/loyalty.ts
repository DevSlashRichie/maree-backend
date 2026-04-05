import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import {
  loyaltyTransactionsTable,
  rewardRedemptionsTable,
} from "@/infrastructure/db/schema";

export type LoyaltyTransaction = InferSelectModel<
  typeof loyaltyTransactionsTable
>;

export const LoyaltyTransactionSchema = createSelectSchema(
  loyaltyTransactionsTable,
);

export const RewardRedeemSchema = createSelectSchema(rewardRedemptionsTable);

export type RewardredeemSchemaType = z.infer<typeof RewardRedeemSchema>;

export type LoyaltyTransactionType = z.infer<typeof LoyaltyTransactionSchema>;
