"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useEffect } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Stack,
  Button,
  Skeleton,
  Typography,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

import { useGeolocation } from "@/hooks/use-geolocation";

import { useRouter } from "@/i18n/routing";
import { DEFAULT_ADDRESS } from "@/config-global";
import { saveFavAddress } from "@/actions/auth-methods";
import { validateAddress } from "@/actions/profile-actions";

import { GoogleMap } from "@/components/map";

import type { Position } from "@/types/map";

type ValidationStatus = "idle" | "loading" | "valid" | "invalid";

type Props = {
  noWarehouseNear?: boolean;
  onComplete: () => void;
};

export function InitAddressChoose({
  noWarehouseNear = false,
  onComplete,
}: Props) {
  const t = useTranslations("Pages.GuestGate");
  const router = useRouter();

  const [position, setPosition] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");

  const {
    location: geoLocation,
    permissionStatus,
    getLocation,
  } = useGeolocation();

  const defaultMapPosition = useMemo<Position>(
    () => ({
      lat: Number(DEFAULT_ADDRESS.latitude),
      lng: Number(DEFAULT_ADDRESS.longitude),
    }),
    [],
  );

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const mapVisible =
    permissionStatus === "granted" || permissionStatus === "denied";
  const effectivePos = position ?? geoLocation ?? defaultMapPosition;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (mapVisible) {
      setValidationStatus("loading");
      timer = setTimeout(async () => {
        const res = await validateAddress(
          effectivePos.lat.toString(),
          effectivePos.lng.toString(),
        );
        setValidationStatus("error" in res ? "invalid" : "valid");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [effectivePos.lat, effectivePos.lng, geoLocation, mapVisible]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await saveFavAddress(
        {
          latitude: effectivePos.lat.toString(),
          longitude: effectivePos.lng.toString(),
        },
        undefined,
        true,
      );
      onComplete();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogContent sx={{ overflow: "visible" }}>
        <Stack spacing={1.5}>
          <Typography
            variant="body2"
            color={noWarehouseNear ? "error" : "text.secondary"}
          >
            {noWarehouseNear ? t("no_warehouse_near_message") : t("message")}
          </Typography>

          <Box height="20rem" sx={{ mt: 0.5 }}>
            {!mapVisible ? (
              <Skeleton
                variant="rectangular"
                height="100%"
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <GoogleMap
                defaultPosition={geoLocation ?? defaultMapPosition}
                setCurrentPosition={(p) => setPosition(p)}
              />
            )}
          </Box>

          {validationStatus === "invalid" && (
            <Typography variant="caption" color="error">
              {t("address_not_supported")}
            </Typography>
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
        <LoadingButton
          variant="contained"
          color="primary"
          loading={saving || validationStatus === "loading"}
          disabled={validationStatus !== "valid"}
          onClick={handleSubmit}
        >
          {t("confirm_location")}
        </LoadingButton>
      </DialogActions>
    </>
  );
}
