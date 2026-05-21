"use server";

import { endpoints } from "@/utils/endpoints";
import { getData } from "@/utils/crud-fetch-api";

export async function getTenantByDomain(domain: string) {
  return getData<{ tenant_id: string }>(endpoints.tenant.byDomain(domain));
}
