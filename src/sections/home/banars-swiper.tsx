"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import { Box, Stack, styled, IconButton } from "@mui/material";

import { paths } from "@/routes/paths";

import { HEADER } from "@/layouts/config-layout";
import { LocaleType, localesSettings } from "@/i18n/config-locale";

import Iconify from "@/components/iconify";

import { Banar } from "@/types/banars";

const BANNER_MAX_HEIGHT = `calc(100svh - ${HEADER.H_SIMPLE + HEADER.H_MOBILE}px)`;

const StyledButton = styled(IconButton)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: theme.customShadows.card,
  background: "#fff",
  "&:hover": {
    background: "#fafafa",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

interface Props {
  banars: Banar[];
}

function getBanarHref(banar: Banar): string | null {
  if (!banar.ref_type || !banar.ref_id) return null;
  if (banar.ref_type === "PRODUCT") return `${paths.products}/${banar.ref_id}`;
  if (banar.ref_type === "COLLECTION")
    return `${paths.collections}/${banar.ref_id}`;
  if (banar.ref_type === "SUBCATEGORY")
    return `/category?categoryId=${banar.ref_id}`;
  return null;
}

export default function BanarsSwiper({ banars }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { dir } = localesSettings[locale as LocaleType];

  const renderSwiper = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 3000 }}
        navigation={{
          nextEl: ".hero-next",
          prevEl: ".hero-prev",
        }}
        style={{
          height: "100%",
          // complex but gives border radius to card if it's not full screen
          borderRadius: `min(10px, calc(100000px * (100svw /  (100svh - ${HEADER.H_SIMPLE + HEADER.H_MOBILE}px) - 36px/19px)))`,
          width: "100%",
        }}
      >
        {banars?.map((item, index) => {
          const href = getBanarHref(item);
          return (
            <SwiperSlide
              key={index}
              style={{ overflow: "hidden", height: "100%" }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: href ? "pointer" : "default",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  ...(href && {
                    "&:hover": { opacity: 0.9, transform: "scale(1.01)" },
                    "&:active": { opacity: 0.8, transform: "scale(0.99)" },
                  }),
                }}
                onClick={href ? () => router.push(href) : undefined}
              >
                <Image
                  src={item.banar}
                  alt=" "
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: "contain",
                  }}
                />
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );

  const renderButtons = (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        position: "absolute",
        px: 2,
        left: 0,
        top: "50%",
        transform: `translateY(-50%)`,
        width: "100%",
        zIndex: 10,
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}
    >
      <StyledButton className="hero-prev">
        <Iconify
          width={25}
          sx={{ transform: dir === "rtl" ? undefined : "scaleX(-1)" }}
          icon="weui:arrow-filled"
        />
      </StyledButton>
      <StyledButton className="hero-next">
        <Iconify
          width={25}
          sx={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }}
          icon="weui:arrow-filled"
        />
      </StyledButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        position: "relative",
        // width: "100%",
        height: "auto",
        aspectRatio: "36/19",
        maxHeight: BANNER_MAX_HEIGHT,
        marginInline: "auto",
      }}
    >
      {renderSwiper}
      {renderButtons}
    </Box>
  );
}
