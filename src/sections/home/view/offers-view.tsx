import { fetchOffers } from "@/actions/products-actions";

import DailyOffers from "@/sections/home/daily-offers";

export default async function OffersView() {
  const offers = await fetchOffers(1, 8);

  if (!offers || "error" in offers || offers.items.length === 0) {
    return null;
  }

  return <DailyOffers offers={offers.items} />;
}
