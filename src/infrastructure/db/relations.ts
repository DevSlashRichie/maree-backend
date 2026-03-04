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
}));
