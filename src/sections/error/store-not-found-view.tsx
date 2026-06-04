"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

import { Container } from "@mui/material";
import Typography from "@mui/material/Typography";

import CompactLayout from "@/layouts/compact";
import { PageNotFoundIllustration } from "@/assets/illustrations";

import { varBounce, MotionContainer } from "@/components/animate";

// ----------------------------------------------------------------------

export default function StoreNotFoundView() {
  const t = useTranslations("Pages.Error404");
  return (
    <CompactLayout>
      <Container sx={{ textAlign: "center", paddingTop: 5 }}>
        <MotionContainer>
          <m.div variants={varBounce().in}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              {t("title")}
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography sx={{ color: "text.secondary" }}>
              {t("message")}
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <PageNotFoundIllustration
              sx={{
                height: 260,
                my: { xs: 5, sm: 10 },
              }}
            />
          </m.div>
        </MotionContainer>
      </Container>
    </CompactLayout>
  );
}
