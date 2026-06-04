"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Box, Stack, Typography } from "@mui/material";

import { paths } from "@/routes/paths";

import { useCurrency } from "@/utils/format-number";

import ButtonLink from "@/CustomSharedComponents/link-button";

import { ShipmentProduct } from "@/types/order-details";

export default function ShipmentItem({
  shipment,
}: {
  shipment: ShipmentProduct;
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
          {currency(shipment.product_price)} {" / "}
        </Typography>
        {shipment.measurement_unit}
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

      <ButtonLink
        variant="contained"
        color="primary"
        href={`${paths.products}/${shipment.product_id}`}
      >
        {t("buy_again")}
      </ButtonLink>
    </Stack>
  );

  return (
    <Box px={2}>
      <Stack spacing={1} justifyContent="flex-start">
        {renderTopRow}
        {renderBottomRow}
      </Stack>
    </Box>
  );
}
