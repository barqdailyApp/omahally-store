"use client";

import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { Fragment, useState, useCallback } from "react";

import { Stack, Button, Divider } from "@mui/material";

import { useBoolean } from "@/hooks/use-boolean";

import { clearCart } from "@/actions/cart-actions";
import { useCartStore } from "@/contexts/cart-store";

import Iconify from "@/components/iconify";
import { ConfirmDialog } from "@/components/custom-dialog";

import CartItem from "./cart-item";

export default function CartStep() {
  const t = useTranslations("Pages.Cart");
  const { enqueueSnackbar } = useSnackbar();
  const products = useCartStore((state) => state.products);
  const initCart = useCartStore((state) => state.initCart);
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);

  const handleClearCart = useCallback(async () => {
    setLoading(true);
    const res = await clearCart();

    if (res && "error" in res) {
      enqueueSnackbar(res.error, { variant: "error" });
    } else {
      initCart();
    }
    setLoading(false);
    confirm.onFalse();
  }, [confirm, enqueueSnackbar, initCart]);

  return (
    <Stack spacing={2} alignItems="stretch" width="100%">
      <Stack direction="row" justifyContent="flex-end">
        <Button
          color="error"
          size="small"
          startIcon={<Iconify icon="mage:trash" width={18} />}
          onClick={confirm.onTrue}
        >
          {t("clear_cart")}
        </Button>
      </Stack>

      {products.map((item, index) => (
        <Fragment key={item.id}>
          {index !== 0 ? <Divider flexItem /> : null}

          <CartItem product={item} />
        </Fragment>
      ))}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t("clear_cart")}
        content={t("clear_cart_confirm")}
        buttonTitle={t("clear_cart")}
        buttonLoading={loading}
        handleConfirmation={handleClearCart}
      />
    </Stack>
  );
}
