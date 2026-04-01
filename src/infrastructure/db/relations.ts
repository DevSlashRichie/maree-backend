import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  userTable: {
    rolesTable: r.one.rolesTable({
      from: r.userTable.id.through(r.userRoleTable.userId),
      to: r.rolesTable.id.through(r.userRoleTable.roleId),
    }),
    userPasswordTable: r.one.userPasswordTable({
      from: r.userTable.id,
      to: r.userPasswordTable.userId,
    }),
  },
  productTable: {
    productVariantsTable: r.one.productVariantsTable({
      from: r.productTable.id,
      to: r.productVariantsTable.productId,
    }),
  },
  rewardRedemptionsTable: {
    rewardsTable: r.one.rewardsTable({
      from: r.rewardRedemptionsTable.rewardId,
      to: r.rewardsTable.id,
    }),
    branchsTable: r.one.branchsTable({
      from: r.rewardRedemptionsTable.branchId,
      to: r.branchsTable.id,
    }),
  },
  policyTable: {
    rolePoliciesTable: r.many.rolePoliciesTable({
      from: r.policyTable.id,
      to: r.rolePoliciesTable.policyId,
    }),
  },
  rolePoliciesTable: {
    policyTable: r.one.policyTable({
      from: r.rolePoliciesTable.policyId,
      to: r.policyTable.id,
    }),
    rolesTable: r.one.rolesTable({
      from: r.rolePoliciesTable.roleId,
      to: r.rolesTable.id,
    }),
  },
  rewardsTable: {
    discountsTable: r.one.discountsTable({
      from: r.rewardsTable.discountId,
      to: r.discountsTable.id,
    }),
  },
}));
