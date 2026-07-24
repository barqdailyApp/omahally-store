import dynamic from "next/dynamic";

import { fetchBrands } from "@/actions/products-actions";

import { Brand } from "@/types/products";

import BrandsLoading from "../loading/brands-loading";

const BrandsSwiper = dynamic(() => import("../brands-swiper"), {
  ssr: false,
  loading: () => <BrandsLoading />,
});

export default async function BrandsView() {
  const brandsRes = await fetchBrands();
  const brands: Brand[] =
    !brandsRes || "error" in brandsRes ? [] : brandsRes;

  if (brands.length === 0) {
    return null;
  }

  return <BrandsSwiper brands={brands} />;
}
