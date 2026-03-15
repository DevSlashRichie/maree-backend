import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function checkPolicies(
  roleId: string,
  requiredPolicies: string[],
): Promise<boolean> {
  const rbacRepo = new RbacRepo(DB);

  const _policies = await rbacRepo.findPoliciesForRole(roleId);
  const policies = new Set(
    // we use a trick with flatmap to filter while mapping.
    _policies.flatMap((it) => {
      if (it.policyTable?.name) {
        return it.policyTable?.name;
      }

      return [];
    }),
  );

  const isValid = requiredPolicies.every((it) => {
    return policies.has(it);
  });

  return isValid;
}
