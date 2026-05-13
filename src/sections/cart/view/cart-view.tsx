"use client";

import { useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";

import { Box, Step, Stack, Stepper, StepLabel, Container } from "@mui/material";

import { useCartStore } from "@/contexts/cart-store";
import { usecheckoutStore } from "@/contexts/checkout-store";

import CartStep from "../cart-step";
import DoneStep from "../done-step";
import EmptyView from "../empty-view";
import { steps } from "../config-cart";
import PaymentStep from "../payment-step";
import OrderSumamry from "../order-summary";
import TimeLocationStep from "../time-location-step";

export default function Cart({
  wallet,
}: {
  wallet: Record<string, string | number>;
}) {
  const t = useTranslations("Pages.Cart");

  const { products } = useCartStore();
  const { step, setStep, choosenAddress, isDigital } = usecheckoutStore();

  const balance = useMemo(
    () =>
      choosenAddress?.currency
        ? Number(wallet[choosenAddress.currency]) || 0
        : 0,
    [wallet, choosenAddress],
  );

  useEffect(() => {
    setStep(0);
  }, [setStep]);

  const renderHeadding = (
    <Stack py={5} bgcolor="background.neutral">
      <Container>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(`Steps.${label}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Stack>
  );

  const stepsElements = [
    <CartStep />,
    ...(isDigital ? [] : [<TimeLocationStep />]),
    <PaymentStep balance={balance} />,
  ];

  if (step >= stepsElements.length) return <DoneStep />;
  if (products.length === 0) return <EmptyView />;

  return (
    <>
      {renderHeadding}
      <Container sx={{ py: 3 }}>
        <Stack gap={3} direction={{ md: "row" }}>
          <Box flexGrow={1}>{stepsElements[step]}</Box>
          <Box flexShrink={0} width={{ md: "380px" }}>
            <OrderSumamry />
          </Box>
        </Stack>
      </Container>
    </>
  );
}
