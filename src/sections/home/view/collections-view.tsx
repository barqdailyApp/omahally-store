import dynamic from "next/dynamic";

import { fetchCollections } from "@/actions/products-actions";

import { CollectionWithProducts } from "@/types/products";

import CollectionsLoading from "../loading/collections-loading";

const CollectionsList = dynamic(() => import("../collections-list"), {
  ssr: false,
  loading: () => <CollectionsLoading />,
});

export default async function CollectionsView({
  filter,
}: {
  filter: "upper" | "lower" | "both";
}) {
  const collectionsRes = await fetchCollections();
  const collections: CollectionWithProducts[] =
    !collectionsRes || "error" in collectionsRes ? [] : collectionsRes;
  const filteredCollections = collections.filter((item) => {
    if (filter === "both") return true;

    if (filter === "upper") return item.collection.in_header;

    return !item.collection.in_header;
  });

  return (
    <>
      {filteredCollections.length > 0 && (
        <CollectionsList collections={filteredCollections} />
      )}
    </>
  );
}
