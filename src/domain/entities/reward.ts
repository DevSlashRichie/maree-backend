import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { rewardsTable } from "@/infrastructure/db/schema";

export type Reward = InferSelectModel<typeof rewardsTable>;

export const RewardSchema = createSelectSchema(rewardsTable);
export type RewardType = z.infer<typeof RewardSchema>;
