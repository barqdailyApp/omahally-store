"use client";

import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { useMemo, useState, useEffect, useCallback } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import { Stack, Typography, useMediaQuery } from "@mui/material";

import { useCurrency } from "@/utils/format-number";

import { useAuthContext } from "@/auth/hooks";
import { useCartStore } from "@/contexts/cart-store";
import { useNoGuestStore } from "@/contexts/no-guest";
import { addProductToCart } from "@/actions/cart-actions";

import Iconify from "@/components/iconify";

import { ProductMeasurement, ProductOptionGroup } from "@/types/products";

import IncrementerButton from "./incrementer-button";
import ProductOptionsSelector from "./product-options-selector";
import { useProductFormStore } from "./store/product-form-store";

export default function ProductAddForm({ full = false }: { full?: boolean }) {
  const t = useTranslations("Pages.Home.Product");
  const currency = useCurrency();
  const { enqueueSnackbar } = useSnackbar();
  const { authenticated } = useAuthContext();
  const { setOpen: setNoGuestDialogOpen } = useNoGuestStore();
  const isMd = useMediaQuery("(min-width:450px)");
  const [cartProductId, setCartProductId] = useState<string | null>(null);

  const {
    product,
    cartProduct,
    loading,
    setLoading,
    selectedOptions,
    setSelectedOptions,
  } = useProductFormStore();
  const { setProduct } = useCartStore();
  const effectiveQuantity = cartProduct?.quantity || 1;
  const measurement =
    product.product_measurements?.find((item) => item.is_main_unit) ||
    ({} as ProductMeasurement);

  // Sum selected options' prices, split by their group's show_price flag.
  // Walks nested child_groups so child options inherit their own group's flag.
  const { unitPrice, optionsPrice } = useMemo(() => {
    if (cartProduct) {
      return {
        unitPrice: cartProduct.product_price + cartProduct.hidden_options_price,
        optionsPrice: cartProduct.options_price,
      };
    }

    let nonShownOptionsPrice = 0;
    let shownOptionsPrice = 0;

    const accumulate = (group: ProductOptionGroup) => {
      group.options.forEach((option) => {
        if (selectedOptions.includes(option.id)) {
          const price = parseFloat(option.price) || 0;
          if (group.show_price) {
            shownOptionsPrice += price;
          } else {
            nonShownOptionsPrice += price;
          }
        }
        option.child_groups?.forEach(accumulate);
      });
    };

    product.product?.product_option_groups.forEach(accumulate);

    const offerPrice = measurement.offer?.offer_price;
    const originalPrice = measurement.product_category_price?.product_price;
    const finalPrice = offerPrice ?? originalPrice;
    const parsedFinalPrice = Number(finalPrice) || 0;

    return {
      unitPrice: parsedFinalPrice + nonShownOptionsPrice,
      optionsPrice: shownOptionsPrice,
    };
  }, [
    cartProduct,
    measurement.offer?.offer_price,
    measurement.product_category_price?.product_price,
    product.product?.product_option_groups,
    selectedOptions,
  ]);

  const totalPrice = (unitPrice + optionsPrice) * effectiveQuantity;

  useEffect(() => {
    if (cartProductId && !cartProduct) {
      setCartProductId(null);
    }
  }, [cartProductId, cartProduct]);

  // Initialize selectedOptions with default options
  const initializeDefaults = useCallback(() => {
    const defaults: string[] = [];

    if (cartProduct) {
      cartProduct.product_option_groups.forEach((group) => {
        group.options.forEach((option) => {
          if (option.is_selected) {
            defaults.push(option.id);
            // Also add default child options if any
            if (option.child_groups) {
              option.child_groups.forEach((childGroup) => {
                childGroup.options.forEach((childOption) => {
                  if (childOption.is_selected) {
                    defaults.push(childOption.id);
                  }
                });
              });
            }
          }
        });
      });
    } else {
      product.product?.product_option_groups.forEach((group) => {
        group.options.forEach((option) => {
          if (option.is_default) {
            defaults.push(option.id);
            // Also add default child options if any
            if (option.child_groups) {
              option.child_groups.forEach((childGroup) => {
                childGroup.options.forEach((childOption) => {
                  if (childOption.is_default) {
                    defaults.push(childOption.id);
                  }
                });
              });
            }
          }
        });
      });
    }

    if (defaults.length > 0) {
      setSelectedOptions(defaults);
    }
  }, [cartProduct, product.product?.product_option_groups, setSelectedOptions]);

  // Initialize defaults on mount
  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  const validateOptions = useCallback(() => {
    const groupErrors = product.product?.product_option_groups.map((group) => {
      const groupSelectedOptions = selectedOptions.filter((id) =>
        group.options.some((opt) => opt.id === id),
      );
      const selectedCount = groupSelectedOptions.length;

      // Check min selection
      if (selectedCount < group.min_selection) {
        return t("Options.select_at_least_for", {
          count: group.min_selection,
          name: group.name,
        });
      }

      // Check max selection
      if (group.max_selection > 0 && selectedCount > group.max_selection) {
        return t("Options.select_at_most_for", {
          count: group.max_selection,
          name: group.name,
        });
      }

      // Check child groups for selected parent options
      const childErrors = group.options
        .filter(
          (option) =>
            selectedOptions.includes(option.id) && option.child_groups,
        )
        .flatMap(
          (option) =>
            option.child_groups?.map((childGroup) => {
              const childSelectedOptions = selectedOptions.filter((id) =>
                childGroup.options.some((opt) => opt.id === id),
              );
              const childSelectedCount = childSelectedOptions.length;

              if (childSelectedCount < childGroup.min_selection) {
                return t("Options.select_at_least_for", {
                  count: childGroup.min_selection,
                  name: childGroup.name,
                });
              }

              if (
                childGroup.max_selection > 0 &&
                childSelectedCount > childGroup.max_selection
              ) {
                return t("Options.select_at_most_for", {
                  count: childGroup.max_selection,
                  name: childGroup.name,
                });
              }

              return null;
            }) || [],
        );

      const firstChildError = childErrors.find((err) => err !== null);
      if (firstChildError) {
        return firstChildError;
      }

      return null;
    });

    return groupErrors.find((err) => err !== null) || null;
  }, [product.product?.product_option_groups, selectedOptions, t]);

  const handleAddToCart = useCallback(async () => {
    if (!authenticated) {
      setNoGuestDialogOpen(true);
      return;
    }

    // Validate options
    const validationError = validateOptions();
    if (validationError) {
      enqueueSnackbar(validationError, { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      // Add single item to cart
      const res = await addProductToCart({
        product_category_price_id:
          measurement.product_category_price?.product_category_price_id,
        options: selectedOptions,
      });

      if ("error" in res) {
        enqueueSnackbar(res.error, { variant: "error" });
        setLoading(false);
        return;
      }

      setProduct(res);
      setCartProductId(res.id);

      enqueueSnackbar("Product added to cart", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add product to cart", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [
    authenticated,
    validateOptions,
    setLoading,
    setNoGuestDialogOpen,
    enqueueSnackbar,
    measurement.product_category_price?.product_category_price_id,
    selectedOptions,
    setProduct,
  ]);

  return (
    <Stack spacing={3} alignItems="flex-start">
      {/* Options Selector */}
      {product.product?.product_option_groups.length > 0 && (
        <ProductOptionsSelector />
      )}

      {/* Add to Cart Button */}
      {cartProduct ? (
        <Stack spacing={1}>
          <IncrementerButton
            cartProductId={cartProduct.id}
            is_quantity_available={product.product?.is_quantity_available}
          />
        </Stack>
      ) : (
        <LoadingButton
          variant="contained"
          color="primary"
          startIcon={isMd && <Iconify icon="bxs:cart-alt" />}
          onClick={handleAddToCart}
          disabled={!product.product?.is_quantity_available}
          loading={loading}
          fullWidth={!isMd}
        >
          {t("add_to_cart")}
        </LoadingButton>
      )}
      {full && (
        <Typography variant="subtitle2" color="primary">
          {currency(totalPrice)}
        </Typography>
      )}
    </Stack>
  );
}
