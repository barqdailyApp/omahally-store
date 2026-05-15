"use server";

import { endpoints } from "@/utils/endpoints";
import { getData } from "@/utils/crud-fetch-api";

import { Warehouse } from "@/types/warehouse";

export async function fetchActiveWarehouses() {
  return getData<Warehouse[]>(endpoints.warehouses.list);
}
