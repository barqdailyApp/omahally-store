import RouterLink from "next/link";
import { useTranslations } from "next-intl";

import { Box, Link, Stack, Typography } from "@mui/material";

import Iconify from "@/components/iconify";

export default function SectionHeadding({
  titleName,
  href,
}: {
  titleName: string;
  href?: string;
}) {
  const t = useTranslations("Pages.Home");

  return (
    <Box>
      <Stack
        direction="row"
        spacing={3}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h3" sx={{ textAlign: "start" }}>
          {titleName}
        </Typography>
        {href && (
          <Link
            href={href}
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              "&:hover": {
                textDecoration: "underline",
                textDecorationColor: "primary.light",
                textDecorationThickness: "2px",
                textUnderlineOffset: "4px",
              },
            }}
            component={RouterLink}
          >
            {t("action")}
            <Iconify
              icon="weui:arrow-filled"
              sx={{ "[dir='rtl'] &": { transform: "scaleX(-1)" } }}
              width={24}
            />
          </Link>
        )}
      </Stack>

      {/* divider */}
      <Stack
        direction="row"
        sx={{
          width: "100%",
          mt: 2,
          height: 4,
          borderRadius: 0.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "10%",
            height: "100%",
            bgcolor: "secondary.light",
          }}
        />
        <Box
          sx={{
            width: "90%",
            height: "100%",
            bgcolor: "primary.light",
          }}
        />
      </Stack>
    </Box>
  );
}
