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

export const COOKIES_KEYS = {
  session: "session",
  user: "user",
  lang: "NEXT_LOCALE",
  expiryTime: "expiryTime",
  favAddress: "sammartstore-fav-address",
  warehouseId: "sammartstore-warehouse-id",
  warehouseCurrency: "sammartstore-warehouse-currency",
  tenantId: "sammartstore-tenant-id",
};

export const PRODUCTS_PER_PAGE = 35;

export const DEFAULT_ADDRESS: Pick<Address, "latitude" | "longitude"> = {
  latitude: "15.333699",
  longitude: "44.222515",
};
