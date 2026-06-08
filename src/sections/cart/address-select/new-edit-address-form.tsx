import * as yup from "yup";
import { useMemo, useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { yupResolver } from "@hookform/resolvers/yup";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  Skeleton,
  FormLabel,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
} from "@mui/material";

import { usecheckoutStore } from "@/contexts/checkout-store";
import { addAddress, editAddress, validateAddress } from "@/actions/profile-actions";
import { useGeolocation } from "@/hooks/use-geolocation";

import { GoogleMap } from "@/components/map";
import FormProvider, {
  RHFCheckbox,
  RHFTextField,
} from "@/components/hook-form";

import AuthPhoneField, {
  phoneSchema,
} from "@/sections/auth/jwt/components/phone-field";

import { Address } from "@/types/profile";

type ValidationStatus = "idle" | "loading" | "valid" | "invalid";

interface Props {
  address: Address | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewEditAddressForm({ address, onClose, onSuccess }: Props) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();
  const { setAddresses, setChoosenAddress } = usecheckoutStore();

  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");

  const { location: geoLocation, permissionStatus, getLocation } = useGeolocation();
  const geoResolved = permissionStatus === "granted" || permissionStatus === "denied";

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(t("Global.Error.name_required")),
        address: yup
          .string()
          .required(t("Global.Error.address_description_required")),
        phone: phoneSchema(yup, t),
        latitude: yup.string().required(t("Global.Error.location_required")),
        longitude: yup.string().required(t("Global.Error.location_required")),
        is_favorite: yup.boolean().required(),
      })
    ),
    defaultValues: useMemo(
      () => ({
        name: address?.name || "",
        address: address?.address || "",
        phone: address?.phone || "",
        latitude: address?.latitude || "",
        longitude: address?.longitude || "",
        is_favorite: address?.is_favorite || false,
      }),
      [
        address?.address,
        address?.is_favorite,
        address?.latitude,
        address?.longitude,
        address?.name,
        address?.phone,
      ]
    ),
  });

  const {
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Set form position from geoLocation when creating a new address
  useEffect(() => {
    if (!geoLocation || address) return;
    if (watch("latitude") || watch("longitude")) return;
    methods.setValue("latitude", geoLocation.lat.toString());
    methods.setValue("longitude", geoLocation.lng.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLocation, address]);

  const watchedLat = watch("latitude");
  const watchedLng = watch("longitude");

  // Validate position with 500ms debounce whenever lat/lng changes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (geoResolved && watchedLat && watchedLng) {
      setValidationStatus("loading");
      timer = setTimeout(async () => {
        const res = await validateAddress(watchedLat, watchedLng);
        setValidationStatus("error" in res ? "invalid" : "valid");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [watchedLat, watchedLng, geoResolved]);

  const onSubmit = handleSubmit(async (data) => {
    if (address) {
      const res = await editAddress({ ...data, id: address.id });
      if ("error" in res) {
        enqueueSnackbar(res.error, { variant: "error" });
      } else {
        setAddresses((prev) =>
          prev.map((item) => (item.id === address.id ? res : item))
        );
        if (res.is_favorite) setChoosenAddress(res);
        onClose();
      }
    } else {
      const res = await addAddress(data);
      if ("error" in res) {
        enqueueSnackbar(res.error, { variant: "error" });
      } else {
        setAddresses((prev) => [...prev, res]);
        if (res.is_favorite) setChoosenAddress(res);
        onSuccess ? onSuccess() : onClose();
      }
    }
  });

  const mapDefaultPosition =
    watchedLat && watchedLng
      ? { lat: Number(watchedLat), lng: Number(watchedLng) }
      : geoLocation ?? undefined;

  return (
    <>
      <DialogTitle>
        {t(`Pages.Cart.Location.${address ? "edit-title" : "new-title"}`)}
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods}>
          <Box height="20rem">
            {!geoResolved ? (
              <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 1 }} />
            ) : (
              <GoogleMap
                defaultPosition={mapDefaultPosition}
                setCurrentPosition={(position) => {
                  methods.setValue("latitude", position.lat.toString());
                  methods.setValue("longitude", position.lng.toString());
                }}
              />
            )}
          </Box>
          {(errors?.latitude || errors?.longitude) && (
            <FormHelperText error>
              {errors?.latitude?.message || errors?.longitude?.message}
            </FormHelperText>
          )}
          {validationStatus === "invalid" && (
            <FormHelperText error>
              {t("Pages.GuestGate.address_not_supported")}
            </FormHelperText>
          )}

          <FormLabel sx={{ mt: 1 }}>{t("Global.Label.name")}</FormLabel>
          <RHFTextField name="name" />

          <FormLabel sx={{ mt: 1 }}>
            {t("Global.Label.address_description")}
          </FormLabel>
          <RHFTextField name="address" />

          <RHFCheckbox
            name="is_favorite"
            label={t("Global.Label.is_default_address")}
            sx={{ mt: 1 }}
          />
          <AuthPhoneField name="phone" sx={{ mt: 1 }} />
        </FormProvider>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={() => onClose()}>
          {t("Pages.Cart.Location.back")}
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={isSubmitting || validationStatus === "loading"}
          disabled={validationStatus !== "valid"}
          onClick={() => onSubmit()}
        >
          {t(`Pages.Cart.Location.${address ? "edit" : "new"}`)}
        </LoadingButton>
      </DialogActions>
    </>
  );
}
