import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Box, Stack, Container, Typography } from "@mui/material";

export type FooterProps = {
  unifiedContactPhone?: string;
  mobileContactPhone?: string;
  whatsappNumber?: string;
  email?: string;
  appStoreLink?: string;
  playStoreLink?: string;
};

export default function Footer({
  unifiedContactPhone,
  mobileContactPhone,
  whatsappNumber,
  email,
  appStoreLink,
  playStoreLink,
}: FooterProps) {
  const t = useTranslations("Global.Footer");

  const contactItems = [
    unifiedContactPhone,
    mobileContactPhone,
    whatsappNumber,
    email,
  ].filter(Boolean) as string[];

  const renderContact = (
    <Box>
      <Typography
        variant="h3"
        fontWeight={500}
        letterSpacing=".02em"
        component="h2"
      >
        {t("contact_title")}
      </Typography>
      {contactItems.map((item, index) => (
        <Typography
          dir="ltr"
          sx={{
            "[dir='rtl'] &": {
              width: { sm: "fit-content" },
              marginInlineStart: { sm: "auto" },
            },
          }}
          key={index}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );

  const renderAppDownload = (
    <Stack spacing={1}>
      <Typography
        variant="h6"
        fontWeight={500}
        letterSpacing=".02em"
        textAlign="center"
      >
        {t("download")}
      </Typography>
      {appStoreLink && (
        <Link href={appStoreLink} target="_blank">
          <Image
            src="/assets/images/footer/download-ios.svg"
            width={186}
            height={55}
            alt={t("download_ios")}
          />
        </Link>
      )}
      {playStoreLink && (
        <Link href={playStoreLink} target="_blank">
          <Image
            src="/assets/images/footer/download-android.svg"
            width={186}
            height={55}
            alt={t("download_android")}
          />
        </Link>
      )}
    </Stack>
  );

  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        color: "white",
        py: {
          xs: 2,
          md: 3,
        },
      }}
      component="footer"
    >
      <Container>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          textAlign={{ xs: "center", sm: "start" }}
          spacing={3}
          justifyContent="space-between"
          alignItems="center"
        >
          {renderContact}
          {renderAppDownload}
        </Stack>
      </Container>
    </Box>
  );
}
