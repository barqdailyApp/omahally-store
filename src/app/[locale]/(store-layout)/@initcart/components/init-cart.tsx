"use client";

import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";

import { useAuthContext } from "@/auth/hooks";
import { getAppTheme } from "@/actions/theme";
import { useCartStore } from "@/contexts/cart-store";
import { fetchAddresses } from "@/actions/profile-actions";
import { getCurrencies } from "@/actions/currency-actions";
import { usecheckoutStore } from "@/contexts/checkout-store";
import { fetchPayments, fetchFullCart } from "@/actions/cart-actions";

import RequiredAddressDialog from "@/sections/cart/address-select/required-address-dialog";

export default function InitCart() {
  const { authenticated } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const { initProducts, setDeliveryFee, setMinOrderPrice } = useCartStore();
  const {
    setAddresses,
    setDeliveryTypes,
    setPayments,
    setCurrencies,
    setIsDigital,
    setTaxRate,
    setWarehouseId,
    setIsAddressRequired,
  } = usecheckoutStore();

  useEffect(() => {
    if (!authenticated) {
      (async () => {
        let isAddressRequried = true;
        const appTheme = await getAppTheme();
        if (!("error" in appTheme)) {
          isAddressRequried = appTheme.data.theme.is_address_required;
        }
        setIsAddressRequired(isAddressRequried);

        const currenciesRes = await getCurrencies();

        if ("error" in currenciesRes) {
          if (currenciesRes.status !== 401)
            enqueueSnackbar(currenciesRes.error, { variant: "error" });
        } else {
          setCurrencies(currenciesRes.data);
        }
      })();
    } else {
      (async () => {
        let isAddressRequried = true;
        const appTheme = await getAppTheme();
        if (!("error" in appTheme)) {
          isAddressRequried = appTheme.data.theme.is_address_required;
        }

        const cartRes = await fetchFullCart();
        if ("error" in cartRes) {
          if (cartRes.status !== 401)
            enqueueSnackbar(cartRes.error, { variant: "error" });
        } else {
          initProducts(cartRes.products);
          setIsDigital(cartRes.is_digital);
          setTaxRate(cartRes.warehouse?.tax_rate);
          setWarehouseId(cartRes.warehouse?.id ?? null);
          setMinOrderPrice(Number(cartRes.warehouse?.min_order_price));
          setDeliveryFee(cartRes.delivery_fee);
          if (!isAddressRequried) {
            setDeliveryTypes(cartRes.warehouse?.delivery_type);
          }
        }

        const addressesRes = await fetchAddresses();

        if ("error" in addressesRes) {
          if (addressesRes.status !== 401)
            enqueueSnackbar(addressesRes.error, { variant: "error" });
        } else {
          if (isAddressRequried && addressesRes.length === 0) {
            setAddressDialogOpen(true);
          }
          setAddresses(addressesRes, isAddressRequried);
        }
        setIsAddressRequired(isAddressRequried);

        const currenciesRes = await getCurrencies();

        if ("error" in currenciesRes) {
          if (currenciesRes.status !== 401)
            enqueueSnackbar(currenciesRes.error, { variant: "error" });
        } else {
          setCurrencies(currenciesRes.data);
        }

        const paymentsRes = await fetchPayments();

        if ("error" in paymentsRes) {
          if (paymentsRes.status !== 401)
            enqueueSnackbar(paymentsRes.error, { variant: "error" });
        } else {
          setPayments(paymentsRes);
        }
      })();
    }
  }, [
    authenticated,
    enqueueSnackbar,
    initProducts,
    setAddresses,
    setCurrencies,
    setDeliveryFee,
    setDeliveryTypes,
    setIsAddressRequired,
    setIsDigital,
    setMinOrderPrice,
    setPayments,
    setTaxRate,
    setWarehouseId,
  ]);

  return <RequiredAddressDialog open={addressDialogOpen} />;
}
