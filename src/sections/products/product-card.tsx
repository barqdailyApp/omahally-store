"use client";

import Link from "next/link";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Card,
  Stack,
  Button,
  styled,
  CardMedia,
  CardProps,
  Typography,
  CardContent,
} from "@mui/material";

import { RouterLink } from "@/routes/components";

import { useCurrency } from "@/utils/format-number";

import { useAuthContext } from "@/auth/hooks";
import { COOKIES_KEYS } from "@/config-global";
import { useCartStore } from "@/contexts/cart-store";
import { useNoGuestStore } from "@/contexts/no-guest";
import { addProductToCart } from "@/actions/cart-actions";

import Label from "@/components/label";
import Iconify from "@/components/iconify";
import { useSnackbar } from "@/components/snackbar";

import { Offer, Product, SubCategoryProduct } from "@/types/products";

import IncrementerButton from "./incrementer-button";

interface Props {
  product: Product | Offer | SubCategoryProduct;
  href: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&.selected": { boxShadow: `0px 0px 0px 1px ${theme.palette.primary.main}` },
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.customShadows.primary,
    zIndex: 9,
  },
  borderRadius: theme.shape.borderRadius,
  "& .card-clickable-layer": {
    zIndex: 2,
  },
  "& .non-clickable-layer": {
    zIndex: 3,
  },
}));

export function ProductCard({
  product,
  href,
  ...cardProps
}: Props & CardProps) {
  const t = useTranslations("Pages.Home.Product");
  const { authenticated } = useAuthContext();
  const { setOpen } = useNoGuestStore();
  const { setProduct } = useCartStore();
  const { enqueueSnackbar } = useSnackbar();
  const [adding, setAdding] = useState(false);

  const { products } = useCartStore();

  const cartProduct = products.find(
    (item) => item.product_id === product.product_id,
  );

  const offerPrice = product.offer_price;
  const originalPrice = product.product_price;
  const finalPrice = offerPrice ?? originalPrice;
  const offerPercentage = offerPrice
    ? Math.round(
        ((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) *
          100,
      )
    : 0;

  const currency = useCurrency();

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      if (!authenticated) {
        setOpen(true);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (!product.is_quantity_available || adding) return;
      setAdding(true);
      try {
        const warehouseId = getCookie(COOKIES_KEYS.warehouseId);

        const res = await addProductToCart({
          product_category_price_id: product.product_category_price_id,
          options: [],
          quantity: product.min_order_quantity,
          ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        });
        if ("error" in res) {
          enqueueSnackbar(res.error ?? t("add_to_cart_failed"), {
            variant: "error",
          });
          return;
        }
        setProduct(res);
      } catch {
        enqueueSnackbar(t("add_to_cart_failed"), { variant: "error" });
      } finally {
        setAdding(false);
      }
    },
    [
      authenticated,
      product.is_quantity_available,
      product.product_category_price_id,
      product.min_order_quantity,
      adding,
      setOpen,
      setProduct,
      enqueueSnackbar,
      t,
    ],
  );

  const renderRowControl = () => {
    if (!product.is_quantity_available)
      return (
        <Button
          component={RouterLink}
          href={href}
          variant="contained"
          color="primary"
          size="small"
          disabled
          sx={{
            p: 1,
            minWidth: "fit-content",
            height: "auto",
            aspectRatio: "1/1",
            borderRadius: "50%",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {t("sold_out")}
        </Button>
      );

    if (!product.direct_add && authenticated)
      return (
        <Button
          component={RouterLink}
          href={href}
          variant="contained"
          color="primary"
          size="small"
          sx={{
            padding: 0,
            minWidth: "30px",
            height: "auto",
            aspectRatio: "1/1",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Iconify
            icon="mingcute:right-line"
            width={20}
            sx={{ "[dir=rtl] &": { transform: "rotate(180deg)" } }}
          />
        </Button>
      );

    if (!cartProduct)
      return (
        <LoadingButton
          type="button"
          variant="contained"
          color="primary"
          size="small"
          sx={{
            padding: 0,
            minWidth: "30px",
            height: "auto",
            aspectRatio: "1/1",
          }}
          onClick={handleAddToCart}
          loading={adding}
        >
          <Iconify icon="mingcute:add-line" width={20} />
        </LoadingButton>
      );

    return (
      <IncrementerButton
        cartProductId={cartProduct.id}
        is_quantity_available={product.is_quantity_available}
        orientation="vertical"
      />
    );
  };

  return (
    <StyledCard {...cardProps} className={cardProps.className}>
      <Box
        className="card-clickable-layer"
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
        }}
        href={href}
        scroll={false}
        component={Link}
      />
      <Box position="relative">
        <CardMedia
          src={product.product_logo ?? undefined}
          alt={product.product_name}
          sx={{
            height: "auto",
            aspectRatio: "4/5",
            objectFit: "contain",
            cursor: "pointer",
            position: "relative",
          }}
          component="img"
        />

        <Stack
          spacing={0.5}
          alignItems="flex-start"
          sx={{
            position: "absolute",
            top: 6,
            insetInlineStart: 6,
            zIndex: 1,
          }}
        >
          {!!product.tags?.length &&
            product.tags.map((tag) => (
              <Label
                key={tag.id}
                variant="filled"
                sx={{ bgcolor: "secondary.main", color: "primary.main" }}
              >
                {tag.name}
              </Label>
            ))}

          {!product.is_quantity_available && (
            <Label color="error">{t("no_available")}</Label>
          )}
        </Stack>

        {product.is_quantity_available && offerPrice && offerPercentage > 0 && (
          <Label
            color="error"
            sx={{
              position: "absolute",
              bottom: 6,
              insetInlineStart: 6,
            }}
            variant="filled"
          >
            -{offerPercentage}%
          </Label>
        )}

        <Stack
          spacing={0.5}
          alignItems="flex-end"
          sx={{
            position: "absolute",
            top: 6,
            insetInlineEnd: 6,
            zIndex: 1,
          }}
        >
          {cartProduct && (
            <Button
              component={RouterLink}
              href="/cart"
              variant="soft"
              color="primary"
              size="small"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Iconify icon="bxs:cart-alt" width={14} />
              {t("in_cart")}
            </Button>
          )}
        </Stack>
      </Box>

      <CardContent
        component={Stack}
        spacing={0.5}
        flexGrow={1}
        sx={{
          p: ".5rem !important",
          paddingBottom: ".6rem !important",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{ flexGrow: 1 }}
        >
          <Box
            sx={{
              alignSelf: "stretch",
              display: "grid",
              gridTemplateRows: "auto auto auto",
              alignContent: "space-between",
            }}
          >
            {product.barcode && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flex: "0 0 auto" }}
              >
                {product.barcode}
              </Typography>
            )}
            <Typography
              variant="body1"
              fontWeight={600}
              component="p"
              sx={{
                flex: "1 1 auto",
                minWidth: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 0,
                height: "fit-content",
                alignSelf: "flex-start",
              }}
            >
              {product.product_name}
            </Typography>
            <Typography
              fontWeight={600}
              color={offerPrice ? "error" : "primary"}
              suppressHydrationWarning
              sx={{ flex: "0 0 auto" }}
            >
              {offerPrice && (
                <Typography component="del" color="text.disabled">
                  {currency(originalPrice, false)}
                </Typography>
              )}{" "}
              <span style={{ whiteSpace: "nowrap" }}>
                {currency(finalPrice)}
              </span>
            </Typography>
          </Box>
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="non-clickable-layer"
            onClick={(e) => e.stopPropagation()}
          >
            {renderRowControl()}
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
