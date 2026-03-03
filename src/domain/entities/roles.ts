import type { Actor } from "./actor";

export type Role = "administrator" | "customer";

export function hasRole(actor: Actor, role: Role) {
  return actor.role === role;
}
