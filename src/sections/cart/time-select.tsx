"use client";

import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { Fragment, useState, useEffect } from "react";

import { DateCalendar } from "@mui/x-date-pickers";
import {
  Stack,
  Switch,
  Dialog,
  Select,
  Divider,
  MenuItem,
  ButtonBase,
  Typography,
  DialogContent,
  SelectChangeEvent,
} from "@mui/material";

import { useBoolean } from "@/hooks/use-boolean";

import { fDate, useFormatDate } from "@/utils/format-time";

import { fetchTimeSlots } from "@/actions/cart-actions";
import { usecheckoutStore } from "@/contexts/checkout-store";

import Label from "@/components/label";

import { TimeSlot } from "@/types/cart";

export default function TimeSelect() {
  const t = useTranslations("Pages.Cart");
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
  } = usecheckoutStore();
  const dateDialog = useBoolean();
  const formateDate = useFormatDate();
  const [times, setTimes] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const getTimeSlots = async () => {
      const res = await fetchTimeSlots(
        fDate(day, "MM-dd-yyyy"),
        choosenDeliveryType === "SCHEDULED",
      );
      if ("error" in res) {
        enqueueSnackbar(res.error, { variant: "error" });
      } else {
        setTimes(res);
        setTimeSlot(res?.[0] || null);
      }
    };

    getTimeSlots();
  }, [choosenDeliveryType, day, enqueueSnackbar, setTimeSlot]);

  const renderDeliveryTypes = deliveryTypes.map((item, index) => (
    <Fragment key={item}>
      {index !== 0 ? <Divider flexItem /> : null}

      <ButtonBase onClick={() => setChoosenDeliveryType(item)}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          py={1.5}
          paddingInlineStart={1.5}
        >
          <Typography>{t(`DeliveryTypes.${item}`)}</Typography>

          {item === "FAST" && (
            <Label
              color="warning"
              marginInlineStart="auto"
              sx={{ bgcolor: "warning.main", color: "white" }}
            >
              {Math.trunc(choosenAddress?.delivery_time || 40)} {t("minutes")}
            </Label>
          )}

          <Switch checked={choosenDeliveryType === item} />
        </Stack>
      </ButtonBase>
    </Fragment>
  ));

  const renderDeliveryTime = (
    <>
      <Divider />
      <ButtonBase
        onClick={() => dateDialog.onTrue()}
        sx={{ justifyContent: "flex-start" }}
      >
        <Typography py={2.5} paddingInlineStart={1.5}>
          تاريخ التسليم :
          <Typography color="primary.main" variant="body2" component="span">
            {formateDate(day)}
          </Typography>
        </Typography>
      </ButtonBase>
      {times.length > 0 ? (
        <Select
          value={timeSlot?.id || undefined}
          onChange={(event: SelectChangeEvent) =>
            setTimeSlot(
              times.find((item) => item.id === event.target.value) || null,
            )
          }
        >
          {times.map((item) => (
            <MenuItem value={item.id} key={item.id}>
              {`${item.start_time === "00:00" ? "12:00" : item.start_time} - ${item.end_time === "00:00" ? "12:00" : item.end_time} ${t(`TimeZones.${item.time_zone}`)}`}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Typography
          variant="body2"
          color="error"
          paddingInlineStart={1.5}
          pb={2.5}
        >
          {t("no_delivery_available_that_day")}
        </Typography>
      )}
    </>
  );

  const dateSelector = (
    <Dialog open={dateDialog.value} onClose={dateDialog.onFalse}>
      <DialogContent>
        <DateCalendar
          value={day}
          onChange={(value) => {
            setDay(value);
            dateDialog.onFalse();
          }}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {renderDeliveryTypes}
      {["SCHEDULED", "WAREHOUSE_PICKUP"].includes(
        choosenDeliveryType as string,
      ) && renderDeliveryTime}
      {dateSelector}
    </>
  );
}
