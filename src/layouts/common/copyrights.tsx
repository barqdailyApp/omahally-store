import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

import Stack from "@mui/material/Stack";
import { Box, Container, IconButton, Typography } from "@mui/material";

import Iconify from "@/components/iconify";

import { SOCIAL_LINKS } from "../config-info";

// ----------------------------------------------------------------------

type CopyrightsProps = {
  appName?: string;
};

export default function Copyrights({ appName }: CopyrightsProps) {
  const t = useTranslations("Global.Footer");

  return (
    <Box>
      <Container>
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          py={1}
          gap={1}
        >
          <Typography color="text.secondary" variant="caption">
            {appName
              ? t("copyright", { year: new Date().getFullYear(), appName })
              : ""}
          </Typography>

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
            >
              <Image
                src="/logo/logo-full-620-240.png"
                fill
                alt="Omahally"
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Stack>

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
        </Stack>
      </Container>
    </Box>
  );
}
