import { RbacRepo } from "@/domain/repositories/rbac-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function checkPolicies(
  roleId: string,
  requiredPolicies: string[],
): Promise<boolean> {
  const rbacRepo = new RbacRepo(DB);

  const _policies = await rbacRepo.findPoliciesForRole(roleId);
  const policies = new Set(
    _policies.map((it) => {
      return it.policy.name;
    }),
  );

  const isValid = requiredPolicies.every((it) => {
    return policies.has(it);
  });

  return isValid;
}
