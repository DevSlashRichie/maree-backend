export async function checkPolicies(
  _roleId: string,
  existingPolicies: string[],
  requiredPolicies: string[],
): Promise<boolean> {
  const policies = new Set(existingPolicies);

  if (policies.has("manage:all")) {
    return true;
  }

  const isValid = requiredPolicies.every((it) => {
    return policies.has(it);
  });

  return isValid;
}
