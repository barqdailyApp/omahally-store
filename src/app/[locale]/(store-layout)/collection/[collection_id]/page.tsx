import { getTranslations } from "next-intl/server";

import { Alert, Box } from "@mui/material";

import {
  fetchCollectionById,
  fetchProductsByCollection,
} from "@/actions/products-actions";

import ProductsListView from "@/sections/products/view/products-list-view";
import SectionHeadding from "@/sections/home/components/section-headding";

interface Props {
  params: {
    collection_id: string;
  };
  searchParams: Record<"page", string | undefined>;
}

export default async function Page({
  params: { collection_id },
  searchParams: { page },
}: Props) {
  const t = await getTranslations();
  const res = await fetchCollectionById(
    collection_id,
    page ? Number(page) : 1,
    50,
  );

  if ("error" in res) {
    return <Alert severity="error">{res.error}</Alert>;
  }

  if (res.pagesCount === 0) {
    return (
      <Alert severity="warning">{t("Global.Error.no_products_found")}</Alert>
    );
  }

  return (
    <>
      <SectionHeadding titleName={res.data.collection.name} />
      <Box mt={4} />
      <ProductsListView
        products={res.data.products.data}
        pagesCount={res.pagesCount}
      />
    </>
  );
}
