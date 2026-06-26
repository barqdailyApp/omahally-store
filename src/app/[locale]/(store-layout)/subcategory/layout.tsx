import { getTranslations } from "next-intl/server";

import { Container } from "@mui/material";

import { LocaleType } from "@/i18n/config-locale";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Container sx={{ pt: 3 }}>{children}</Container>;
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: LocaleType };
}) {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("Title.products"),
  };
}

