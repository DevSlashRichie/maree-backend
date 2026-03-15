import type { Executor } from "@/infrastructure/db/postgres";

export class RbacRepo {
  constructor(private readonly conn: Executor) {}

  async findPoliciesForRole(roleId: string) {
    const policies = await this.conn.query.rolePoliciesTable.findMany({
      where: {
        OR: [
          {
            roleId,
          },
          {
            rolesTable: {
              name: roleId,
            },
          },
        ],
      },
      with: {
        policyTable: true,
        rolesTable: {
          columns: {},
        },
      },
    });

    return policies;
  }
}
