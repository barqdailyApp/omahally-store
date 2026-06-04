import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  Box,
  Grid,
  Card,
  Stack,
  TextField,
  Typography,
  CardContent,
} from "@mui/material";

import { useCurrency } from "@/utils/format-number";

import { useCartStore } from "@/contexts/cart-store";
import { usecheckoutStore } from "@/contexts/checkout-store";

import ActiveCard from "@/components/active-card";

import PaymentDetails from "./payment-details";

export default function PaymentStep({ balance }: { balance: number }) {
  const t = useTranslations("Pages.Cart.Payment");
  const { setPromocode, totalPrice } = useCartStore();
  const {
    payments,
    choosenPayment,
    setChoosenPayment,
    walletDiscount,
    setWalletDiscount,
  } = usecheckoutStore();
  const currency = useCurrency();

  const renderPayments = (
    <Grid container spacing={1}>
      {payments.map((payment) => (
        <Grid item xs={6} sm={3} key={payment.id}>
          <ActiveCard
            active={choosenPayment?.id === payment.id}
            onClick={() => {
              setChoosenPayment(payment);
              setPromocode(null);
            }}
            sx={{ minHeight: "100%" }}
            activeRing="bold"
          >
            <CardContent
              sx={{
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Image
                width={100}
                height={100}
                src={payment.logo}
                alt={payment.name}
                style={{ borderRadius: "1.5rem" }}
              />
              <Typography variant="h6">{payment.name}</Typography>
            </CardContent>
          </ActiveCard>
        </Grid>
      ))}
    </Grid>
  );

  const rednerWalletDiscount = (
    <Card>
      <CardContent component={Stack} spacing={1}>
        <Typography variant="h6">{t("wallet_discount")}</Typography>
        <TextField
          value={walletDiscount}
          onChange={(e) => setWalletDiscount(Number(e.target.value))}
          fullWidth
          type="number"
          inputProps={{
            max: Math.min(balance, totalPrice),
          }}
          helperText={<>{t("wallet_balance")}: {currency(balance)}</>}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderPayments}
      <Box mt={3} />
      {balance > 0 && rednerWalletDiscount}
      <Box mt={3} />
      <PaymentDetails />
    </Box>
  );
}
