import { openTenantDB, tenantDBPath } from "../../../db/tenantDb.js";

export function getTenantDB(userId: number) {
  return openTenantDB(tenantDBPath(userId));
}
