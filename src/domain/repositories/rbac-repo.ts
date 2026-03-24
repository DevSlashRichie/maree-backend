import { eq } from "drizzle-orm";
import type { Executor } from "@/infrastructure/db/postgres";
import {
  policyTable,
  rolePoliciesTable,
  rolesTable,
  userRoleTable,
} from "@/infrastructure/db/schema";
import { isUuid } from "@/lib/uuid";

export class RbacRepo {
  constructor(private readonly conn: Executor) {}

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

  async findRoleByName(name: string) {
    const role = await this.conn.query.rolesTable.findFirst({
      where: {
        name,
      },
    });

    return role;
  }

  async deleteAllUserRoles(userId: string) {
    await this.conn
      .delete(userRoleTable)
      .where(eq(userRoleTable.userId, userId));
  }

  async assignRoleToUser(userId: string, roleId: string) {
    await this.conn.insert(userRoleTable).values({
      userId,
      roleId,
    });
  }
}
