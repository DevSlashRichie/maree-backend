import type { ActorType } from "./actor";

export type Role = "administrator" | "customer";

export function hasRole(actor: ActorType, role: Role) {
  return actor.role === role;
}
