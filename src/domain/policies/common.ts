import type { Actor } from "@/domain/entities/actor";

export interface Policy<A> {
    check(actor: Actor, payload: A): boolean;
}
