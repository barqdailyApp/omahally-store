"use server";

import { cookies } from "next/headers";

import { endpoints } from "@/utils/endpoints";
import { getData } from "@/utils/crud-fetch-api";

import { COOKIES_KEYS } from "@/config-global";

import { AppTheme } from "@/types/theme";

import { getFavAddress } from "./auth-methods";

export async function getAppTheme() {
  const cookieStore = cookies();
  const isLoggedIn = Boolean(cookieStore.get(COOKIES_KEYS.session)?.value);
  const favAddress = isLoggedIn ? null : await getFavAddress();
  const searchParams = new URLSearchParams();

  if (!isLoggedIn && favAddress) {
    searchParams.set("longitude", favAddress.longitude);
    searchParams.set("latitude", favAddress.latitude);
  }

  const res = await getData<AppTheme>(
    searchParams.size
      ? `${endpoints.theme}?${searchParams.toString()}`
      : endpoints.theme,
  );

  return res;
}
