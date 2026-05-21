"use client";

import { useEffect } from "react";
import { useSnackbar } from "notistack";

import { useAuthContext } from "@/auth/hooks";
import { useCartStore } from "@/contexts/cart-store";
import { fetchSections } from "@/actions/products-actions";
import { fetchAddresses } from "@/actions/profile-actions";
import { getCurrencies } from "@/actions/currency-actions";
import { usecheckoutStore } from "@/contexts/checkout-store";
import { fetchPayments, fetchFullCart } from "@/actions/cart-actions";

export default function InitCart() {
  const { authenticated } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { initProducts } = useCartStore();
  const {
    setAddresses,
    setDeliveryTypes,
    setPayments,
    setCurrencies,
    setIsDigital,
    setTaxRate,
    setWarehouseId,
  } = usecheckoutStore();

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const cartRes = await fetchFullCart();
      if ("error" in cartRes) {
        if (cartRes.status !== 401)
          enqueueSnackbar(cartRes.error, { variant: "error" });
      } else {
        initProducts(cartRes.products);
        setIsDigital(cartRes.is_digital);
        setTaxRate(cartRes.warehouse.tax_rate);
        setWarehouseId(cartRes.warehouse.id ?? null);
      }

      const sectionRes = await fetchSections();

      if ("error" in sectionRes) {
        if (sectionRes.status !== 401)
          enqueueSnackbar(sectionRes.error, { variant: "error" });
      } else {
        setDeliveryTypes([]);
      }

      const addressesRes = await fetchAddresses();

      if ("error" in addressesRes) {
        if (addressesRes.status !== 401)
          enqueueSnackbar(addressesRes.error, { variant: "error" });
      } else {
        setAddresses(addressesRes);
      }

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
  }, [
    authenticated,
    enqueueSnackbar,
    initProducts,
    setAddresses,
    setCurrencies,
    setDeliveryTypes,
    setIsDigital,
    setPayments,
    setTaxRate,
    setWarehouseId,
  ]);

  return null;
}
