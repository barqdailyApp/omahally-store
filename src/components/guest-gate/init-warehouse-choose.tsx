"use client";

import { setCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Radio,
  Stack,
  Button,
  RadioGroup,
  Typography,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from "@mui/material";

import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

import { useGeolocation } from "@/hooks/use-geolocation";

import { useRouter } from "@/i18n/routing";
import { COOKIES_KEYS } from "@/config-global";
import { saveFavAddress } from "@/actions/auth-methods";
import { validateAddress } from "@/actions/profile-actions";
import { fetchActiveWarehouses } from "@/actions/warehouse-actions";

import type { Warehouse } from "@/types/warehouse";

import { LoadingScreen } from "../loading-screen";

type Props = {
  onComplete: () => void;
};

export function InitWarehouseChoose({ onComplete }: Props) {
  const t = useTranslations("Pages.GuestGate");
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const {
    location: geoLocation,
    permissionStatus,
    getLocation,
  } = useGeolocation();

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Fetch and validate warehouses once geolocation is resolved
  useEffect(() => {
    if (permissionStatus !== "granted") return;

    (async () => {
      setLoading(true);
      const res = await fetchActiveWarehouses();

      if ("error" in res) {
        setWarehouses([]);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        res.data.map(async (warehouse) => {
          const validation = await validateAddress(
            geoLocation!.lat.toString(),
            geoLocation!.lng.toString(),
            warehouse.id,
          );
          return "error" in validation ? null : warehouse;
        }),
      );

      setWarehouses(results.filter((w): w is Warehouse => w !== null));
      setLoading(false);
    })();
  }, [permissionStatus, geoLocation]);

  const handleSubmit = async () => {
    const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);
    if (!warehouse) return;
    setSaving(true);
    try {
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
      onComplete();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const geoResolved =
    permissionStatus === "granted" || permissionStatus === "denied";

  if (loading) {
    return (
      <>
        <DialogContent>
          <LoadingScreen sx={{ pt: 6, pb: 4 }} />
        </DialogContent>
        <DialogActions />
      </>
    );
  }

  if (!geoResolved || permissionStatus === "denied") {
    return (
      <>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t("location_required")}
          </Typography>
        </DialogContent>
        <DialogActions />
      </>
    );
  }

  const hasWarehouses = warehouses.length > 0;

  return (
    <>
      <DialogContent>
        {hasWarehouses ? (
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
        ) : (
          <Stack py={4} spacing={1} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {t("no_warehouses_message")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("no_warehouses_auth_message")}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button
          variant="outlined"
          href={paths.auth.jwt.login}
          LinkComponent={RouterLink}
        >
          {t("login")}
        </Button>
        {hasWarehouses && (
          <LoadingButton
            variant="contained"
            color="primary"
            loading={saving}
            disabled={!selectedWarehouseId}
            onClick={handleSubmit}
          >
            {t("confirm_location")}
          </LoadingButton>
        )}
      </DialogActions>
    </>
  );
}
