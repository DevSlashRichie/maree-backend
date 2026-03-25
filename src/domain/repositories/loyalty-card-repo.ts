import type { Executor } from "@/infrastructure/db/postgres";

export class LoyaltyCardRepo {
    constructor(private readonly conn: Executor) {}

    async findById(id: string) {
        
    }

}