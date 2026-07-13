import { paths } from "@/routes/paths";

import { Address } from "./types/profile";

// API
// ----------------------------------------------------------------------

export const {
  NEXT_PUBLIC_HOST_API: HOST_API,
  NEXT_PUBLIC_TENANT_ID: TENANT_ID,
  HOST_DOMAIN: ASSETS_API,
} = process.env;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.home; // as '/dashboard'

export const SESSION_PERIOD = 60 * 30 * 1_000; //  (60 seconds * 30 * (1_000 = 1s)) = 30 Minutes;

// cookies().set's `maxAge` expects seconds, not milliseconds
export const LOGIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const COOKIES_KEYS = {
  session: "session",
  user: "user",
  lang: "NEXT_LOCALE",
  expiryTime: "expiryTime",
  favAddress: "sammartstore-fav-address",
  warehouseId: "sammartstore-warehouse-id",
  warehouseCurrency: "sammartstore-warehouse-currency",
  tenantId: "sammartstore-tenant-id",
  popupBanarSeen: "sammartstore-popup-banar-seen",
};

export const PRODUCTS_PER_PAGE = 35;

export const DEFAULT_ADDRESS: Pick<Address, "latitude" | "longitude"> = {
  latitude: "24.708957223243402",
  longitude: "46.673366364510215",
};
