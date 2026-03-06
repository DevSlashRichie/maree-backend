import type { Role } from "./roles";
import type { User } from "./user";

export interface Actor extends User {
  role: Role;
}
