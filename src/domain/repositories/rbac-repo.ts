import type { Executor } from "@/infrastructure/db/postgres";
import {
  policyTable,
  rolePoliciesTable,
  rolesTable,
} from "@/infrastructure/db/schema";
import { isUuid } from "@/lib/uuid";
import { eq } from "drizzle-orm";

export class RbacRepo {
  constructor(private readonly conn: Executor) { }

  async findPoliciesForRole(roleId: string) {
    const policies = await this.conn
      .select()
      .from(rolePoliciesTable)
      .innerJoin(rolesTable, eq(rolePoliciesTable.roleId, rolesTable.id))
      .innerJoin(policyTable, eq(policyTable.id, rolePoliciesTable.policyId))
      .where(
        isUuid(roleId)
          ? eq(rolePoliciesTable.roleId, roleId)
          : eq(rolesTable.name, roleId),
      );

    return policies;
  }
}
