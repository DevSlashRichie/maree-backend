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
  loyaltyCardsTable: {
    loyaltyTransactionsTable: r.one.loyaltyTransactionsTable({
      from: r.loyaltyCardsTable.id,
      to: r.loyaltyTransactionsTable.loyaltyCardId,
    }),
    userTable: r.one.userTable({
      from: r.loyaltyCardsTable.userId,
      to: r.userTable.id,
    }),
  },
  loyaltyTransactionsTable: {
    loyaltyCardsTable: r.one.loyaltyCardsTable({
      from: r.loyaltyTransactionsTable.loyaltyCardId,
      to: r.loyaltyCardsTable.id,
    }),
  },
}));
