"use client";

import Image from "next/image";
import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { useMemo, useState, useEffect, useCallback } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Stack,
  Alert,
  Button,
  Dialog,
  Checkbox,
  TextField,
  ButtonBase,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
  LinearProgress,
} from "@mui/material";

import { paths } from "@/routes/paths";

import { useBoolean } from "@/hooks/use-boolean";

import { useCurrency } from "@/utils/format-number";

import { invalidateCaching } from "@/actions/cache-invalidation";
import { returnOrder, fetchReturnReasons } from "@/actions/order-actions";

import Label from "@/components/label";

import { CancelReason } from "@/types/order";
import { SingleShipment, ShipmentProduct } from "@/types/order-shipment";

export default function ReturnButton({
  shipment,
}: {
  shipment: SingleShipment;
}) {
  const t = useTranslations("Pages.Orders.Single.Return");
  const returnDialog = useBoolean();

  return (
    <>
      <Button
        size="large"
        sx={{ flexGrow: 1, flexBasis: 110 }}
        onClick={() => returnDialog.onTrue()}
      >
        {t("action")}
      </Button>

      {returnDialog.value && (
        <ReturnDialog
          orderId={shipment.order.id}
          shipmentProducts={shipment.shipment_products}
          onClose={returnDialog.onFalse}
        />
      )}
    </>
  );
}

type CheckedProducts = Record<
  string,
  Partial<{
    quantity: number;
    reasonId: string;
  }>
>;
function ReturnDialog({
  orderId,
  shipmentProducts,
  onClose,
}: {
  orderId: string;
  shipmentProducts: ShipmentProduct[];
  onClose: VoidFunction;
}) {
  const t = useTranslations("Pages.Orders.Single.Return");
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsloading] = useState(false);
  const [reasons, setReasons] = useState<CancelReason[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetchReturnReasons();

      if ("data" in res) {
        setReasons(res.data);
      } else {
        enqueueSnackbar(res.error, { variant: "error" });
      }
    })();
  }, [enqueueSnackbar]);

  const [notes, setNotes] = useState<string>("");
  const [checkedProducts, setCheckedProducts] = useState<CheckedProducts>({});
  const checkedIds = useMemo(
    () => Object.keys(checkedProducts),
    [checkedProducts]
  );
  const handleCheck = useCallback((id: string) => {
    setCheckedProducts((prev) => {
      const checkedPrev = Object.keys(prev);
      if (checkedPrev.includes(id)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: {
          quantity: 1,
        },
      };
    });
  }, []);

  const renderShipment = (shipment: ShipmentProduct) => {
    let type: string;

    if (shipment.can_return) {
      type = "CAN_RETURN";
    } else if (shipment.is_recoverd) {
      type = "RECOVERED";
    } else {
      type = "CANNOT_RETURN";
    }

    const checked = checkedIds.includes(shipment.id);

    return (
      <Box>
        <ProductCheckButton
          shipment={shipment}
          onClick={() => handleCheck(shipment.id)}
          checked={checked}
          disabled={type !== "CAN_RETURN"}
        />
        {type === "RECOVERED" && (
          <Label variant="soft" color="error">
            {t("Errors.recovered_before")}
          </Label>
        )}
        {checked && (
          <ProductFields
            quantity={checkedProducts[shipment.id]?.quantity || 0}
            setQuantity={(value) =>
              setCheckedProducts((prev) => ({
                ...prev,
                [shipment.id]: { ...prev[shipment.id], quantity: value },
              }))
            }
            maxQuantity={shipment.quantity}
            reasonId={checkedProducts[shipment.id]?.reasonId || ""}
            setReasonId={(value) =>
              setCheckedProducts((prev) => ({
                ...prev,
                [shipment.id]: { ...prev[shipment.id], reasonId: value },
              }))
            }
            reasons={reasons}
          />
        )}
      </Box>
    );
  };

  const checkErrors = useCallback(() => {
    let error: string | undefined;
    const noReason = shipmentProducts.find(
      (item) =>
        checkedIds.includes(item.id) && !checkedProducts[item.id]?.reasonId
    );
    const noQuantity = shipmentProducts.find(
      (item) =>
        checkedIds.includes(item.id) && !checkedProducts[item.id]?.quantity
    );
    const quantityExceed = shipmentProducts.find(
      (item) =>
        checkedIds.includes(item.id) &&
        checkedProducts[item.id]?.quantity &&
        (checkedProducts[item.id].quantity as number) > item.quantity
    );

    if (noReason)
      error = t("Errors.no_reason", { name: noReason.product_name });
    if (noQuantity)
      error = t("Errors.no_quantity", { name: noQuantity.product_name });
    if (quantityExceed)
      error = t("Errors.quantity_exceed", {
        name: quantityExceed.product_name,
        quantity: quantityExceed.quantity,
      });

    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return true;
    }
    return false;
  }, [checkedIds, checkedProducts, enqueueSnackbar, shipmentProducts, t]);

  const onSubmit = useCallback(() => {
    if (checkErrors()) return;
    (async () => {
      setIsloading(true);
      const res = await returnOrder({
        orderId,
        body: {
          returned_shipment_products: checkedIds.map((id) => ({
            shipment_product_id: id,
            quantity: checkedProducts[id].quantity as number,
            return_product_reason_id: checkedProducts[id].reasonId as string,
          })),
          customer_note: notes,
        },
      });

      if ("error" in res) {
        enqueueSnackbar(res.error, { variant: "error" });
      } else {
        enqueueSnackbar(t("success"));
        onClose();
        invalidateCaching(`${paths.orders}/${orderId}`);
      }
      setIsloading(false);
    })();
  }, [
    checkErrors,
    checkedIds,
    checkedProducts,
    enqueueSnackbar,
    notes,
    onClose,
    orderId,
    t,
  ]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      {reasons.length === 0 ? (
        <Box
          sx={{
            px: 5,
            width: 1,
            flexGrow: 1,
            minHeight: "min(30rem, 80vh)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
        </Box>
      ) : (
        <>
          <DialogTitle textAlign="center">{t("title")}</DialogTitle>
          <DialogContent>
            <Alert severity="info">{t("sub_title")}</Alert>

            <Stack pt={2}>
              {shipmentProducts.map((product) => renderShipment(product))}
            </Stack>
            <TextField
              label={t("note")}
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={() => onClose()}>
              {t("cancel")}
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={() => onSubmit()}
              loading={isLoading}
            >
              {t("submit")}
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function ProductCheckButton({
  shipment,
  onClick,
  checked,
  disabled,
}: {
  shipment: ShipmentProduct;
  onClick: () => void;
  checked: boolean;
  disabled: boolean;
}) {
  const t = useTranslations("Pages.Orders.Single.Shipment");
  const currency = useCurrency();

  const renderTopRow = (
    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ flexGrow: 1, flexBasis: "200px" }}
      >
        <Image
          src={shipment.product_logo}
          alt={shipment.product_name}
          width={60}
          height={60}
          style={{
            borderRadius: "50px",
            objectFit: "cover",
          }}
        />

        <Box>
          <Typography
            variant="body1"
            fontWeight="700"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {shipment.product_name}
          </Typography>
          <Typography variant="subtitle2" mt={0.5} fontWeight="400">
            {`${t("quantity")} : ${shipment.quantity}`}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="subtitle2" fontWeight="400" flexShrink={0}>
        <Typography variant="body2" fontWeight="bold" component="span">
          {currency(shipment.price)} {" / "}
        </Typography>
        {shipment.measurement_unit_name}
      </Typography>
    </Stack>
  );

  const renderBottomRow = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mt: 1 }}
    >
      <Typography variant="subtitle2">
        {`${t("total")} : `}
        <Typography variant="inherit" fontWeight="700" component="span">
          {currency(shipment.total_price)}
        </Typography>
      </Typography>
    </Stack>
  );

  return (
    <ButtonBase
      key={shipment.id}
      component="div"
      sx={{
        py: 2,
        paddingInlineEnd: 2,
        borderRadius: "10px",
        width: "100%",
      }}
      onClick={() => onClick()}
      disabled={disabled}
    >
      <Stack direction="row" alignItems="center" spacing={2} width="100%">
        <Checkbox
          checked={checked}
          sx={{ flexShrink: 0 }}
          disabled={disabled}
          disableRipple
        />
        <Stack
          spacing={1}
          justifyContent="flex-start"
          flexGrow={1}
          sx={{ opacity: disabled ? 0.5 : undefined }}
        >
          {renderTopRow}
          {renderBottomRow}
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

function ProductFields({
  quantity,
  setQuantity,
  maxQuantity,
  reasonId,
  setReasonId,
  reasons,
}: {
  quantity: number;
  setQuantity: (value: number) => void;
  maxQuantity: number;
  reasonId: string;
  setReasonId: (value: string) => void;
  reasons: CancelReason[];
}) {
  const t = useTranslations("Pages.Orders.Single.Return");

  return (
    <Stack
      direction="row"
      spacing={1}
      my={1.5}
      flexWrap="wrap"
      justifyContent="stretch"
      width="100%"
    >
      <Autocomplete
        options={Array.from({ length: maxQuantity }, (_, i) => i + 1)}
        renderInput={(params) => (
          <TextField {...params} label={t("quantity")} value={quantity} />
        )}
        onChange={(e, value) => {
          setQuantity(value || 0);
        }}
        sx={{ flexGrow: 1, flexBasis: "150px" }}
      />
      <Autocomplete
        options={reasons}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("reason")}
            value={reasons.find((item) => item.id === reasonId)?.name}
          />
        )}
        onChange={(e, value) => {
          setReasonId(value?.id || "");
        }}
        sx={{ flexGrow: 1, flexBasis: "150px" }}
      />
    </Stack>
  );
}
