import { fetchBanars } from "@/actions/banars-actions";

import { Banar } from "@/types/banars";

import BanarsSwiper from "../banars-swiper";

export default async function BannersView() {
  const banarsRes = await fetchBanars();
  const banars: Banar[] =
    !banarsRes || "error" in banarsRes ? [] : banarsRes;

  if (banars.length === 0) {
    return null;
  }

  return <BanarsSwiper banars={banars} />;
}
