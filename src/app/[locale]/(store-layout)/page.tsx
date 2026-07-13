import "swiper/css";
import "swiper/css/pagination";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { getAppTheme } from "@/actions/theme";
import { LocaleType } from "@/i18n/config-locale";

import BrandsView from "@/sections/home/view/brands-view";
import OffersView from "@/sections/home/view/offers-view";
import BannersView from "@/sections/home/view/banners-view";
import CategoriesView from "@/sections/home/view/categories-view";
import PopupBanarView from "@/sections/home/view/popup-banar-view";
import OrderAgainView from "@/sections/home/view/order-again-view";
import BrandsLoading from "@/sections/home/loading/brands-loading";
import OffersLoading from "@/sections/home/loading/offers-loading";
import CollectionsView from "@/sections/home/view/collections-view";
import BannersLoading from "@/sections/home/loading/banners-loading";
import CategoriesLoading from "@/sections/home/loading/categories-loading";
import CollectionsLoading from "@/sections/home/loading/collections-loading";

export default async function Page() {
  const theme = await getAppTheme();
  let showOffers = true;
  let showOrderAgain = true;
  if (!("error" in theme)) {
    showOffers = theme.data?.theme.show_offer ?? true;
    showOrderAgain = theme.data?.theme.order_again ?? true;
  }

  return (
    <>
      <Suspense fallback={null}>
        <PopupBanarView />
      </Suspense>

      <Suspense fallback={<BannersLoading />}>
        <BannersView />
      </Suspense>

      <Suspense fallback={<BrandsLoading />}>
        <BrandsView />
      </Suspense>

      <Suspense fallback={<CollectionsLoading />}>
        <CollectionsView filter="upper" />
      </Suspense>

      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesView />
      </Suspense>

      <Suspense fallback={<CollectionsLoading />}>
        <CollectionsView filter="lower" />
      </Suspense>

      {showOffers && (
        <Suspense fallback={<OffersLoading />}>
          <OffersView />
        </Suspense>
      )}

      {showOrderAgain && (
        <Suspense fallback={<OffersLoading />}>
          <OrderAgainView />
        </Suspense>
      )}
    </>
  );
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: LocaleType };
}) {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("Title.home"),
  };
}
