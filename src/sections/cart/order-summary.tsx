import { useMemo } from "react";
import { useTranslations } from "next-intl";

import {
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  CardContent,
} from "@mui/material";

import { useDir } from "@/routes/hooks/use-dir";

import { useCurrency } from "@/utils/format-number";
import { useFormatDate } from "@/utils/format-time";

import { useCartStore } from "@/contexts/cart-store";
import { usecheckoutStore } from "@/contexts/checkout-store";

import Iconify from "@/components/iconify";
import { LabelColor } from "@/components/label";

import FinishButton from "./finish-button";
import PromoCodeField from "./promo-code-field";

export default function OrderSumamry() {
  const t = useTranslations("Pages.Cart");
  const dir = useDir();
  const currency = useCurrency();
  const formateDate = useFormatDate();
  const {
    step,
    setStep,
    choosenDeliveryType,
    day,
    timeSlot,
    choosenAddress,
    taxRate,
    isDigital,
  } = usecheckoutStore();
  const {
    totalPrice,
    minOrderPrice,
    deliveryFee: initDeliveryFee,
    promocode,
  } = useCartStore();

  const deliveryFee = useMemo(
    () => (isDigital ? 0 : initDeliveryFee),
    [initDeliveryFee, isDigital],
  );

  const { totalWithDiscount, discount } = useMemo(() => {
    const _discount = promocode?.discount || 0;
    return {
      totalWithDiscount: (totalPrice * (100 - _discount)) / 100,
      discount: _discount,
    };
  }, [totalPrice, promocode?.discount]);

  const fields = useMemo(() => {
    const items: {
      label?: string;
      value: React.ReactNode;
      color?: LabelColor;
      fontWeight?: number;
    }[] = [
      {
        label: t("Summary.products-total"),
        value: currency(totalPrice),
        color: totalPrice < minOrderPrice ? "error" : undefined,
        fontWeight: totalPrice < minOrderPrice ? 700 : undefined,
      },
      ...(minOrderPrice > totalPrice
        ? [
            {
              label: t("Summary.min-order-price"),
              value: currency(minOrderPrice),
              color: "error" as LabelColor,
            },
          ]
        : []),
      ...(discount
        ? [{ label: t("PromoCode.label"), value: `${discount}%` }]
        : []),
      ...(deliveryFee
        ? [
            {
              label: t("Summary.shipping"),
              value: currency(deliveryFee),
            },
          ]
        : []),
      ...(Number(taxRate ?? 0)
        ? [
            {
              label: t("Summary.tax_rate"),
              value: `${Number(taxRate ?? 0)}% (${currency((Number(taxRate ?? 0) / 100) * (totalWithDiscount + deliveryFee))})`,
            },
          ]
        : []),

      {
        label: t("Summary.total"),
        value: currency(
          totalWithDiscount +
            deliveryFee +
            (Number(taxRate ?? 0) / 100) * totalWithDiscount,
        ),
      },
      { value: <PromoCodeField /> },
    ];

    if (step > 1)
      items.push(
        { value: <Divider flexItem /> },
        {
          label: t("Summary.delivery-type"),
          value: t(`DeliveryTypes.${choosenDeliveryType}`),
        },
      );

    if (step > 1 && choosenDeliveryType === "SCHEDULED")
      items.push(
        {
          label: t("Summary.delivery-day"),
          value: formateDate(day),
        },
        {
          label: t("Summary.delivery-time"),
          value: `${timeSlot?.start_time} - ${timeSlot?.end_time} ${t(`TimeZones.${timeSlot?.time_zone}`)}`,
        },
      );

    if (step > 1 && choosenDeliveryType !== "WAREHOUSE_PICKUP")
      items.push({
        label: t("Summary.delivery-address"),
        value: choosenAddress?.name || "",
      });

    return items;
  }, [
    t,
    currency,
    totalPrice,
    minOrderPrice,
    discount,
    deliveryFee,
    taxRate,
    totalWithDiscount,
    step,
    choosenDeliveryType,
    formateDate,
    day,
    timeSlot?.start_time,
    timeSlot?.end_time,
    timeSlot?.time_zone,
    choosenAddress?.name,
  ]);

  const renderFields = (
    <Stack spacing={1}>
      {fields.map((item) =>
        item.label ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
            key={item.label}
          >
            <Typography variant="body2" fontWeight="500">
              {item.label}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={item.fontWeight || "400"}
              color={item.color}
            >
              {item.value}
            </Typography>
          </Stack>
        ) : (
          item.value
        ),
      )}
    </Stack>
  );

  const renderActions = (
    <Stack direction="row" spacing={1}>
      {step > 0 && (
        <Button
          variant="outlined"
          onClick={() => setStep((prev) => prev - 1)}
          sx={{ flexShrink: 0 }}
        >
          <Iconify
            icon="ic:round-keyboard-arrow-left"
            sx={{
              transform: dir === "rtl" ? "rotate(180deg)" : undefined,
              minWidth: 0,
            }}
          />
        </Button>
      )}
      {step === 2 ? (
        <FinishButton sx={{ flexGrow: 1 }} />
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setStep((prev) => prev + 1)}
          sx={{ flexGrow: 1 }}
          disabled={
            totalPrice < minOrderPrice ||
            (!choosenDeliveryType && !isDigital && step >= 1)
          }
        >
          {t("Summary.next")}
        </Button>
      )}
    </Stack>
  );

  return (
    <Card
      sx={{
        border: "1px solid #CFCFCF",
        borderRadius: "20px",
        padding: 0.3,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" textAlign="center">
          {t("Summary.title")}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {renderFields}

        <Divider sx={{ my: 2 }} />

        {renderActions}
      </CardContent>
    </Card>
  );
}
