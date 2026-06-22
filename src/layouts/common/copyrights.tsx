import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

import Stack from "@mui/material/Stack";
import { Box, Container, IconButton, Typography } from "@mui/material";

import Iconify from "@/components/iconify";

import { SOCIAL_LINKS } from "../config-info";

// ----------------------------------------------------------------------

export type PaymentMethods = {
  mada?: boolean;
  apple_pay?: boolean;
  tabby?: boolean;
  card_payments?: boolean;
  tamara?: boolean;
};

const PAYMENT_ICONS: { key: keyof PaymentMethods; src: string; alt: string }[] =
  [
    {
      key: "mada",
      src: "https://cdn.salla.network/images/payment/mada_mini.png?v=2.0.5",
      alt: "Mada",
    },
    {
      key: "card_payments",
      src: "https://cdn.salla.network/images/payment/credit_card_mini.png?v=2.0.5",
      alt: "Credit Card",
    },
    {
      key: "apple_pay",
      src: "https://cdn.salla.network/images/payment/apple_pay_mini.png?v=2.0.5",
      alt: "Apple Pay",
    },
    {
      key: "tabby",
      src: "https://cdn.salla.network/images/payment/tabby_installment_mini.png?v=2.0.5",
      alt: "Tabby",
    },
    {
      key: "tamara",
      src: "https://cdn.salla.network/images/payment/tamara_installment_mini.png?v=2.0.5",
      alt: "Tamara",
    },
  ];

type CopyrightsProps = {
  appName?: string;
  paymentMethods?: PaymentMethods;
};

export default function Copyrights({
  appName,
  paymentMethods,
}: CopyrightsProps) {
  const t = useTranslations("Global.Footer");
  console.log(paymentMethods);

  return (
    <Box>
      <Container>
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          alignItems="center"
          justifyContent={
            !appName && !SOCIAL_LINKS.length ? "center" : "space-between"
          }
          py={1}
          gap={1}
        >
          {appName && (
            <Typography color="text.secondary" variant="caption">
              {t("copyright", { year: new Date().getFullYear(), appName })}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography color="text.disabled" variant="caption">
              {t("created_by")}
            </Typography>
            <Box
              sx={{
                width: { xs: 93, md: 124 },
                height: { xs: 36, md: 48 },
                position: "relative",
              }}
              component={Link}
              href="https://omahally.com"
              target="_blank"
            >
              <Image
                src="/logo/logo-full-620-240.png"
                fill
                alt="Omahally"
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Stack>

          {SOCIAL_LINKS.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              {SOCIAL_LINKS.map((item) => (
                <IconButton
                  key={item.name}
                  href={item.link}
                  sx={{ color: "text.disabled", p: 0.8 }}
                  target="_blank"
                  LinkComponent={Link}
                >
                  <Iconify icon={item.icon} width={20} height={20} />
                </IconButton>
              ))}
            </Stack>
          )}

          {paymentMethods &&
            PAYMENT_ICONS.some(({ key }) => paymentMethods[key]) && (
              <Stack direction="row" gap={0.5} alignItems="center">
                {PAYMENT_ICONS.filter(({ key }) => paymentMethods[key]).map(
                  ({ key, src, alt }) => (
                    <Box
                      key={key}
                      sx={{
                        bgcolor: "white",
                        borderRadius: 1,
                        p: 0.25,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={src}
                        alt={alt}
                        width={40}
                        height={24}
                        style={{
                          objectFit: "contain",
                          display: "block",
                          height: "24px",
                          width: "40px",
                        }}
                      />
                    </Box>
                  ),
                )}
              </Stack>
            )}
        </Stack>
      </Container>
    </Box>
  );
}
