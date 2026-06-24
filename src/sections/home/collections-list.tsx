"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { Box, Stack, Container } from "@mui/material";

import { paths } from "@/routes/paths";

import { LocaleType } from "@/i18n/config-locale";
import { HEADER, SECTION_PADDING } from "@/layouts/config-layout";

import { CollectionWithProducts } from "@/types/products";

import CollectionsSwiper from "./collections-swiper";
import SectionHeadding from "./components/section-headding";
import ProductsListView from "../products/view/products-list-view";

const BANNER_BASE_HEIGHT = `(100svh - ${HEADER.H_SIMPLE + HEADER.H_MOBILE}px)`;

const BANNER_HEIGHT_MAP = {
  BIG: `calc(${BANNER_BASE_HEIGHT})`,
  MEDIUM: `calc(${BANNER_BASE_HEIGHT} / 2)`,
  SMALL: `calc(${BANNER_BASE_HEIGHT} / 3)`,
};

interface Props {
  collections: CollectionWithProducts[];
}

export default function CollectionsList({ collections }: Props) {
  const locale = useLocale() as LocaleType;

  return (
    <Box py={SECTION_PADDING}>
      <Container>
        <Stack spacing={4}>
          {collections
            .filter(
              (item) => item.collection.is_banner || item.products?.length,
            )
            .map((item) =>
              item.collection.is_banner ? (
                <CollectionBanner key={item.collection.id} item={item} />
              ) : (
                <CollectionRow
                  key={item.collection.id}
                  item={item}
                  locale={locale}
                />
              ),
            )}
        </Stack>
      </Container>
    </Box>
  );
}

function CollectionBanner({ item }: { item: CollectionWithProducts }) {
  const router = useRouter();
  const { collection } = item;

  if (!collection.image) return null;

  const href = `${paths.collections}/${collection.id}`;
  const height = BANNER_HEIGHT_MAP[collection.size ?? "BIG"];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: "10px",
        overflow: "hidden",
        cursor: collection.is_clickable ? "pointer" : "default",
        ...(collection.is_clickable && {
          transition: "opacity 0.2s ease, transform 0.2s ease",
          "&:hover": { opacity: 0.9, transform: "scale(1.01)" },
          "&:active": { opacity: 0.8, transform: "scale(0.99)" },
        }),
      }}
      onClick={collection.is_clickable ? () => router.push(href) : undefined}
    >
      <Image
        src={collection.image}
        alt={collection.name}
        fill
        sizes="100vw"
        style={{ objectFit: "contain" }}
      />
    </Box>
  );
}

function CollectionRow({
  item,
  locale,
}: {
  item: CollectionWithProducts;
  locale: LocaleType;
}) {
  const { collection } = item;
  const name =
    locale === "ar" ? collection.name_ar || collection.name : collection.name;
  const href = `${paths.collections}/${collection.id}`;

  return (
    <Box key={collection.id}>
      <SectionHeadding titleName={name} href={href} />

      <Box pt={{ xs: 2, sm: 4 }} sx={{ position: "relative" }}>
        {collection.is_grid ? (
          <ProductsListView products={item.products} pagesCount={1} />
        ) : (
          <CollectionsSwiper item={item} />
        )}
      </Box>
    </Box>
  );
}
