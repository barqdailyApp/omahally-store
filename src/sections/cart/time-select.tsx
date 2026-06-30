"use client";

import { useSnackbar } from "notistack";
import { format, addDays } from "date-fns";
import { useTranslations } from "next-intl";
import { Fragment, useState, useEffect } from "react";

import {
  Box,
  Radio,
  Stack,
  Switch,
  Divider,
  ButtonBase,
  Typography,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";

import { fDate } from "@/utils/format-time";

import { fetchTimeSlots } from "@/actions/cart-actions";
import { usecheckoutStore } from "@/contexts/checkout-store";

import Label from "@/components/label";
import LoadingScreen from "@/components/loading-screen/loading-screen";

import { TimeSlot } from "@/types/cart";

export default function TimeSelect() {
  const t = useTranslations("Pages.Cart");
  const tDate = useTranslations("Global.Date");
  const { enqueueSnackbar } = useSnackbar();
  const {
    choosenAddress,
    deliveryTypes,
    choosenDeliveryType,
    setChoosenDeliveryType,
    timeSlot,
    setTimeSlot,
    day,
    setDay,
    warehouseId,
    productsClass,
  } = usecheckoutStore();

  const [slotsMap, setSlotsMap] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!choosenDeliveryType) return;

    const fetchAllDays = async () => {
      setLoading(true);
      const today = new Date();
      const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

      const results = await Promise.all(
        days.map((d) =>
          fetchTimeSlots({
            delivery_day: fDate(d, "MM-dd-yyyy"),
            deliveryType: choosenDeliveryType,
            warehouseId,
          }),
        ),
      );

      const map: Record<string, TimeSlot[]> = {};
      days.forEach((d, i) => {
        const result = results[i];
        const key = fDate(d, "MM-dd-yyyy");
        if (!("error" in result) && result.length > 0) {
          map[key] = result;
        } else if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
      });

      setSlotsMap(map);
      setLoading(false);

      const currentKey = fDate(day, "MM-dd-yyyy");
      if (map[currentKey]) {
        setTimeSlot(map[currentKey][0] || null);
      } else {
        const firstDay = days.find((d) => map[fDate(d, "MM-dd-yyyy")]);
        if (firstDay) {
          setDay(firstDay);
          setTimeSlot(map[fDate(firstDay, "MM-dd-yyyy")][0] || null);
        } else {
          setTimeSlot(null);
        }
      }
    };

    fetchAllDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choosenDeliveryType, warehouseId]);

  const selectedKey = fDate(day, "MM-dd-yyyy");
  const currentTimes = slotsMap[selectedKey] || [];
  const availableDays = Object.keys(slotsMap).map((key) => {
    const [month, d, year] = key.split("-");
    return new Date(`${year}-${month}-${d}`);
  });

  const handleDaySelect = (selected: Date) => {
    setDay(selected);
    const key = fDate(selected, "MM-dd-yyyy");
    setTimeSlot(slotsMap[key]?.[0] || null);
  };

  const renderDeliveryTypes = deliveryTypes
    .map((item) => ({
      label: productsClass === "SERVICE" ? `${item}_${productsClass}` : item,
      value: item,
    }))
    .map(({ value, label }, index) => (
      <Fragment key={value}>
        {index !== 0 ? <Divider flexItem /> : null}

        <ButtonBase onClick={() => setChoosenDeliveryType(value)}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            py={1.5}
            paddingInlineStart={1.5}
          >
            <Typography>{t(`DeliveryTypes.${label}`)}</Typography>

            {value === "FAST" && (
              <Label
                color="warning"
                marginInlineStart="auto"
                sx={{ bgcolor: "warning.main", color: "white" }}
              >
                {Math.trunc(choosenAddress?.delivery_time || 40)} {t("minutes")}
              </Label>
            )}

            <Switch checked={choosenDeliveryType === value} />
          </Stack>
        </ButtonBase>
      </Fragment>
    ));

  const renderDeliveryTime = (
    <>
      <Divider />

      {
        // eslint-disable-next-line no-nested-ternary
        loading ? (
          <LoadingScreen sx={{ py: 4 }} />
        ) : availableDays.length === 0 ? (
          <Typography
            variant="body2"
            color="error"
            paddingInlineStart={1.5}
            py={2.5}
          >
            {t("no_delivery_available_that_day")}
          </Typography>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1}
              py={1.5}
              px={1.5}
              flexWrap="wrap"
            >
              {availableDays.map((d) => {
                const key = fDate(d, "MM-dd-yyyy");
                const isSelected = key === selectedKey;
                const monthKey = format(d, "MMM").toLowerCase();
                const dayNameKey = format(d, "EEEE").toLowerCase();

                return (
                  <ButtonBase
                    key={key}
                    onClick={() => handleDaySelect(d)}
                    sx={{
                      borderRadius: 2,
                      border: "1.5px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "primary.main" : "background.paper",
                      color: isSelected
                        ? "primary.contrastText"
                        : "text.primary",
                      transition: "all 0.15s",
                      minWidth: 56,
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      py={1}
                      px={1.5}
                      gap={0.25}
                    >
                      <Typography variant="caption" lineHeight={1}>
                        {tDate(monthKey as any)}
                      </Typography>
                      <Typography
                        variant="h6"
                        lineHeight={1.2}
                        fontWeight={700}
                      >
                        {format(d, "d")}
                      </Typography>
                      <Typography variant="caption" lineHeight={1}>
                        {tDate(dayNameKey as any)}
                      </Typography>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Stack>

            {currentTimes.length > 0 && (
              <FormControl sx={{ px: 1.5, pb: 1.5 }}>
                <RadioGroup
                  value={timeSlot?.id || ""}
                  onChange={(e) =>
                    setTimeSlot(
                      currentTimes.find((item) => item.id === e.target.value) ||
                        null,
                    )
                  }
                >
                  {currentTimes.map((item) => (
                    <FormControlLabel
                      key={item.id}
                      value={item.id}
                      control={<Radio size="small" />}
                      label={`${item.start_time === "00:00" ? "12:00" : item.start_time} - ${item.end_time === "00:00" ? "12:00" : item.end_time} ${t(`TimeZones.${item.time_zone}`)}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </>
        )
      }
    </>
  );

  return (
    <>
      {renderDeliveryTypes}
      {["SCHEDULED", "WAREHOUSE_PICKUP"].includes(
        choosenDeliveryType as string,
      ) && renderDeliveryTime}
    </>
  );
}
