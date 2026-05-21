import { useSnackbar } from "notistack";
import { useState, forwardRef, useCallback } from "react";

import { Box, ButtonProps } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack, { StackProps } from "@mui/material/Stack";

import { useCartStore } from "@/contexts/cart-store";
import { removeCartProduct, updateCartProduct } from "@/actions/cart-actions";

import Iconify from "@/components/iconify";

import { useProductFormStore } from "./store/product-form-store";

// ----------------------------------------------------------------------

interface Props extends StackProps {
  cartProductId: string;
  is_quantity_available: boolean;
  addButtonProps?: ButtonProps;
  /** Vertical layout (e.g. for product card). Default horizontal for single product / cart. */
  orientation?: "horizontal" | "vertical";
}

const IncrementerButton = forwardRef<HTMLDivElement, Props>(
  (
    {
      cartProductId,
      is_quantity_available,
      addButtonProps,
      orientation = "horizontal",
      sx,
      ...other
    },
    ref,
  ) => {
    const { enqueueSnackbar } = useSnackbar();
    const { products, setProduct, removeProduct } = useCartStore();
    const { setCartProduct } = useProductFormStore();
    const [loading, setLoading] = useState(false);

    const product = products.find((item) => item.id === cartProductId);
    const quantity = product?.quantity || 0;
    const maxQuantity = Math.min(
      ["DIGITAL", "SERVICE"].includes(product?.product_class || "")
        ? Infinity
        : product?.warehouse_quantity || 0,
      product?.max_order_quantity || 0,
    );

    const handleRemove = useCallback(() => {
      if (!product) return;
      (async () => {
        setLoading(true);
        const res = await removeCartProduct(product.id);

        if ("error" in res) {
          enqueueSnackbar(res.error, { variant: "error" });
        } else {
          removeProduct(product.id);
        }
        setLoading(false);
      })();
    }, [enqueueSnackbar, product, removeProduct, setLoading]);

    const handleIncrease = useCallback(() => {
      if (!product) return;
      (async () => {
        setLoading(true);
        const res = await updateCartProduct(product.id, quantity + 1);

        if ("error" in res) {
          enqueueSnackbar(res.error, { variant: "error" });
        } else {
          delete res.options;
          setProduct(res);
          setCartProduct(res);
        }
        setLoading(false);
      })();
    }, [enqueueSnackbar, product, quantity, setCartProduct, setProduct]);

    const handleDecrease = useCallback(() => {
      if (!product) return;
      (async () => {
        setLoading(true);
        const res = await updateCartProduct(product.id, quantity - 1);

        if ("error" in res) {
          enqueueSnackbar(res.error, { variant: "error" });
        } else {
          delete res.options;
          setProduct(res);
        }
        setLoading(false);
      })();
    }, [enqueueSnackbar, product, quantity, setProduct]);

    const isVertical = orientation === "vertical";

    return (
      <Stack
        ref={ref}
        flexShrink={0}
        direction={isVertical ? "column" : "row"}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: !isVertical ? 0.5 : 0,
          width: isVertical ? 30 : 88,
          borderRadius: 1,
          typography: "subtitle2",
          ...sx,
        }}
        {...other}
      >
        <LoadingButton
          size="small"
          variant="contained"
          color="primary"
          onClick={() =>
            quantity > (product?.min_order_quantity || 0)
              ? handleDecrease()
              : handleRemove()
          }
          sx={{
            p: 0,
            minWidth: "30px",
            height: "30px",
            aspectRation: "1",
          }}
          loading={loading}
        >
          <Iconify
            icon={
              quantity > (product?.min_order_quantity || 0)
                ? "eva:minus-fill"
                : "mage:trash"
            }
            width={20}
          />
        </LoadingButton>

        <Box px={1} pt={0.5} mx={1}>
          {quantity}
        </Box>

        <LoadingButton
          size="small"
          variant="contained"
          color="primary"
          onClick={() => handleIncrease()}
          disabled={quantity >= maxQuantity}
          sx={{
            p: 0,
            minWidth: "30px",
            height: "30px",
            aspectRation: "1",
          }}
          loading={loading}
        >
          <Iconify icon="mingcute:add-line" width={20} />
        </LoadingButton>
      </Stack>
    );
  },
);

export default IncrementerButton;
