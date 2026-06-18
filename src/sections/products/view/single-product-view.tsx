"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DOMPurify from "isomorphic-dompurify";

import {
  Box,
  Card,
  Stack,
  Button,
  Container,
  Typography,
  CardContent,
} from "@mui/material";

import { RouterLink } from "@/routes/components";

import { useCurrency } from "@/utils/format-number";

import { SECTION_PADDING } from "@/layouts/config-layout";
import { CartProduct, useCartStore } from "@/contexts/cart-store";

import Label from "@/components/label";
import Iconify from "@/components/iconify";

import ProductAddForm from "@/sections/products/product-add-form";

import { FullProduct, ProductMeasurement } from "@/types/products";

import ProductFavButton from "../fav-button";
import ProductSwiper from "../product-swiper";
import { useProductFormStore } from "../store/product-form-store";

const sanitizeHtml = (html: string): string => {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if ((node as Element).tagName === "A") {
      (node as Element).setAttribute("target", "_blank");
      (node as Element).setAttribute("rel", "noopener noreferrer");
    }
  });
  const clean = DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
  DOMPurify.removeHooks("afterSanitizeAttributes");
  return clean as string;
};

interface Props {
  product: FullProduct;
  cartProduct?: CartProduct;
}

export default function SingleProductView({ product, cartProduct }: Props) {
  const t = useTranslations("Pages.Home.Product");
  const currency = useCurrency();
  const { products } = useCartStore();
  const {
    setProduct,
    setCartProduct,
    product: stateProduct,
    cartProduct: stateCartProduct,
    selectedOptions,
  } = useProductFormStore();

  useEffect(() => {
    setProduct(product);
    if (cartProduct) {
      setCartProduct(cartProduct);
    }
  }, [product, cartProduct, setProduct, setCartProduct]);

  const isInCart = products.some(
    (item) => item.product_id === product.product.product_id,
  );

  const measurement =
    product.product_measurements?.find((item) => item.is_main_unit) ||
    ({} as ProductMeasurement);
  const offerPrice = measurement.offer?.offer_price;
  const originalPrice = measurement.product_category_price?.product_price;
  const finalPrice = offerPrice ?? originalPrice;
  const parsedFinalPrice = Number(finalPrice) || 0;
  const [unitPrice, setUnitPrice] = useState(parsedFinalPrice);

  useEffect(() => {
    if (stateCartProduct) {
      setUnitPrice(
        stateCartProduct.product_price + stateCartProduct.hidden_options_price,
      );
    } else if (stateProduct) {
      const selected = new Set(selectedOptions);
      let price = Number(finalPrice) || 0;
      stateProduct.product?.product_option_groups.forEach((group) => {
        group.options.forEach((option) => {
          if (selected.has(option.id) && !group.show_price) {
            price += parseFloat(option.price) || 0;
          }
          option.child_groups?.forEach((childGroup) => {
            childGroup.options.forEach((childOption) => {
              if (selected.has(childOption.id) && !group.show_price) {
                price += parseFloat(childOption.price) || 0;
              }
            });
          });
        });
      });
      setUnitPrice(price);
    } else {
      setUnitPrice(parsedFinalPrice);
    }
  }, [
    finalPrice,
    parsedFinalPrice,
    selectedOptions,
    stateCartProduct,
    stateProduct,
  ]);

  useEffect(() => {
    setUnitPrice(parsedFinalPrice);
  }, [parsedFinalPrice]);

  const renderSwiper = (
    <ProductSwiper images={product.product.product_images} />
  );

  const renderContent = (
    <Box>
      <Typography variant="h4" component="p">
        {product.product.product_name}
      </Typography>
      <Typography
        variant="h5"
        color="primary"
        gutterBottom
        component="p"
        suppressHydrationWarning
      >
        {offerPrice && (
          <Typography component="del" color="text.disabled">
            {currency(originalPrice, false)}
          </Typography>
        )}{" "}
        {currency(unitPrice)}
      </Typography>
      {!product.product.is_quantity_available && (
        <Label color="error">{t("no_available")}</Label>
      )}
      {product.product.type === "BUNDLE" &&
      product.product.components?.length ? (
        <Box mb={1}>
          <Typography variant="subtitle2" gutterBottom>
            {t("components")}
          </Typography>
          <Stack spacing={0.5}>
            {product.product.components.map((component) => (
              <Typography key={component.component_id} variant="body2">
                {component.quantity} × {component.component_name}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
      <Box
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(product.product.product_description || ""),
        }}
        sx={{
          color: 'text.primary',
          '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
          '& strong': { fontWeight: 700 },
          '& em': { fontStyle: 'italic' },
          '& u': { textDecoration: 'underline' },
          '& a': { color: 'primary.main', textDecoration: 'underline' },
          '& ul': { pl: 3, listStyleType: 'disc' },
          '& ol': { pl: 3, listStyleType: 'decimal' },
          '& p': { mt: 0, mb: 0, minHeight: '1.4em' },
        }}
      />
    </Box>
  );

  const renderActions = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="start"
      spacing={1}
      pt={1}
    >
      <ProductFavButton
        isFav={product.product.product_is_fav}
        productId={product.product.product_id}
        sectionId={product.product.section_id}
        sx={{ alignSelf: "stretch" }}
      />

      {isInCart && (
        <Button
          component={RouterLink}
          href="/cart"
          variant="soft"
          color="primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Iconify icon="bxs:cart-alt" width={14} />
          {t("in_cart")}
        </Button>
      )}

      {(product.product.product_option_groups?.length || 0) === 0 ? (
        <ProductAddForm />
      ) : null}
    </Stack>
  );

  return (
    <Container sx={{ py: SECTION_PADDING }}>
      <Stack direction={{ md: "row" }} spacing={2}>
        <Box flexShrink={0} maxWidth={{ md: "50%" }}>
          {renderSwiper}
        </Box>

        <Stack spacing={2} flexGrow={1}>
          <Card>
            <CardContent>
              {renderContent}

              {renderActions}
            </CardContent>
          </Card>

          {product.product.product_option_groups?.length > 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("options")}
                </Typography>
                <ProductAddForm full />
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
