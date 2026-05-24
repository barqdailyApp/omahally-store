"use client";

import { useTranslations } from "next-intl";
import { getCookie, setCookie } from "cookies-next";
import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Radio,
  Stack,
  Button,
  Dialog,
  RadioGroup,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material";

import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

import { saveFavAddress } from "@/actions/auth-methods";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { COOKIES_KEYS, DEFAULT_ADDRESS } from "@/config-global";
import { fetchActiveWarehouses } from "@/actions/warehouse-actions";

import { GoogleMap } from "@/components/map";

import type { Position } from "@/types/map";
import { Warehouse } from "@/types/warehouse";

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
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isWarehousesLoading, setIsWarehousesLoading] =
    useState(chooseWarehouse);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null,
  );
  const [hasAddressCookie, setHasAddressCookie] = useState(
    () => !!getCookie(COOKIES_KEYS.favAddress),
  );
  const [position, setPosition] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultMapPosition = useMemo<Position>(
    () => ({
      lat: Number(DEFAULT_ADDRESS.latitude),
      lng: Number(DEFAULT_ADDRESS.longitude),
    }),
    [],
  );

  const isAuthRoute = pathname?.startsWith("/auth") ?? false;

  const showGate =
    !loading &&
    !authenticated &&
    (forceOpen || !hasAddressCookie) &&
    !isAuthRoute;

  const handleSaveLocation = useCallback(async () => {
    setSaving(true);
    try {
      if (chooseWarehouse) {
        const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);
        if (!warehouse) return;
        await saveFavAddress(
          {
            latitude: warehouse.latitude.toString(),
            longitude: warehouse.longitude.toString(),
          },
          warehouse.id,
        );
        if (warehouse.currency) {
          setCookie(COOKIES_KEYS.warehouseCurrency, warehouse.currency);
        }
      } else {
        const pos = position ?? defaultMapPosition;
        await saveFavAddress(
          {
            latitude: pos.lat.toString(),
            longitude: pos.lng.toString(),
          },
          undefined,
          true,
        );
      }
      setHasAddressCookie(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [
    chooseWarehouse,
    defaultMapPosition,
    position,
    router,
    selectedWarehouseId,
    warehouses,
  ]);

  // Fetch Warehouses
  useEffect(() => {
    (async () => {
      if (!chooseWarehouse || !showGate) return;
      setIsWarehousesLoading(true);

      const res = await fetchActiveWarehouses();

      if ("error" in res) {
        setWarehouses([]);
      } else {
        setWarehouses(res.data);
      }

      setIsWarehousesLoading(false);
    })();
  }, [showGate, chooseWarehouse]);

  if (loading || (chooseWarehouse && showGate && isWarehousesLoading)) {
    return null;
  }

  if (!showGate) {
    return <>{children}</>;
  }

  const hasWarehouses = warehouses.length > 0;

  let message = !chooseWarehouse ? t("message") : "";
  if (noWarehouseNear) message = t("no_warehouse_near_message");
  else if (chooseWarehouse && !hasWarehouses)
    message = t("no_warehouses_message");

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
      <DialogContent sx={{ overflow: "visible" }}>
        <Stack spacing={1.5}>
          <Typography
            variant="body2"
            color={noWarehouseNear ? "error" : "text.secondary"}
          >
            {message}
          </Typography>

          {chooseWarehouse ? (
            hasWarehouses && (
              <RadioGroup
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
              >
                {warehouses.map((w) => (
                  <FormControlLabel
                    key={w.id}
                    value={w.id}
                    control={<Radio />}
                    label={w.name}
                  />
                ))}
              </RadioGroup>
            )
          ) : (
            <Box height="20rem" sx={{ mt: 0.5 }}>
              <GoogleMap
                defaultPosition={defaultMapPosition}
                setCurrentPosition={(p) => setPosition(p)}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button
          variant="outlined"
          href={paths.auth.jwt.login}
          LinkComponent={RouterLink}
        >
          {t("login")}
        </Button>
        {(!chooseWarehouse || hasWarehouses) && (
          <LoadingButton
            variant="contained"
            color="primary"
            loading={saving}
            disabled={chooseWarehouse && !selectedWarehouseId}
            onClick={handleSaveLocation}
          >
            {t("confirm_location")}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
