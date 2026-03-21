import type { ActorType } from "@/domain/entities/actor";

export interface Policy<A> {
  check(actor: ActorType, payload: A): boolean;
}
