import type { Executor } from "@/infrastructure/db/postgres";
import { branchsTable, reviewsTable } from "@/infrastructure/db/schema";
import type { InferInsertModel } from "drizzle-orm";

type SaveReviewType = Omit<
    InferInsertModel<typeof reviewsTable>, "id" | "createdAt"
>;

export class ReviewRepo {
    constructor(private readonly conn: Executor) {}

    async saveReview(data: SaveReviewType) {
        const [review] = await this.conn
        .insert(reviewsTable)
        .values(data)
        .returning();

         // biome-ignore lint/style/noNonNullAssertion: since we're creating a new user, it should always exist
        return review!;
    }
}