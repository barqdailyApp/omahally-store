"use client";

import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { Dialog, DialogTitle } from "@mui/material";

import { usePathname } from "@/i18n/routing";
import { COOKIES_KEYS } from "@/config-global";
import { useAuthContext } from "@/auth/hooks/use-auth-context";

import { InitAddressChoose } from "./init-address-choose";
import { InitWarehouseChoose } from "./init-warehouse-choose";

type Props = {
  forceOpen?: boolean;
  children: ReactNode;
  noWarehouseNear?: boolean;
  chooseWarehouse?: boolean;
};

export default function GuestGate({
  forceOpen = false,
  children,
  noWarehouseNear = false,
  chooseWarehouse = false,
}: Props) {
  const t = useTranslations("Pages.GuestGate");
  const { loading, authenticated } = useAuthContext();
  const pathname = usePathname();

  const [hasAddressCookie, setHasAddressCookie] = useState(
    () => !!getCookie(COOKIES_KEYS.favAddress),
  );

  const isAuthRoute = pathname?.startsWith("/auth") ?? false;

  const showGate =
    !loading &&
    !authenticated &&
    (forceOpen || !hasAddressCookie) &&
    !isAuthRoute;

  if (loading) return null;
  if (!showGate) return <>{children}</>;

  const handleComplete = () => setHasAddressCookie(true);

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
      onClose={() => {
        /* non-dismissible */
      }}
    >
      <DialogTitle>
        {t(chooseWarehouse ? "warehouse_title" : "map_title")}
      </DialogTitle>
      {chooseWarehouse ? (
        <InitWarehouseChoose onComplete={handleComplete} />
      ) : (
        <InitAddressChoose
          noWarehouseNear={noWarehouseNear}
          onComplete={handleComplete}
        />
      )}
    </Dialog>
  );
}
