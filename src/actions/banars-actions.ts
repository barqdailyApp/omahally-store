"use server";

import { endpoints } from "@/utils/endpoints";
import { getData } from "@/utils/crud-fetch-api";

import { Banar } from "@/types/banars";

export async function fetchBanars() {
  const res = await getData<Banar[]>(endpoints.banars);
  if ("error" in res) {
    return res;
  }
  return res?.data ?? [];
}

export async function fetchPopupBanar() {
  const res = await getData<Banar>(endpoints.banarPopup);
  if ("error" in res) {
    return res;
  }
  return res?.data?.id ? res.data : null;
}
