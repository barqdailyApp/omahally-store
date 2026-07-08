import { getTranslations } from "next-intl/server";

import { Alert } from "@mui/material";

import { LocaleType } from "@/i18n/config-locale";
import {
  fetchCategories,
  fetchSubCategoriesWithProducts,
} from "@/actions/products-actions";

import CategoriesFilter from "@/sections/products/categories-filter";
import ProductsListView from "@/sections/products/view/products-list-view";
import SubCategoriesFilter from "@/sections/products/subCategories-filter";

interface Props {
  searchParams: Record<
    "categoryId" | "subCategoryId" | "page",
    string | undefined
  >;
}

export default async function Page({
  searchParams: { categoryId, subCategoryId, page },
}: Props) {
  const t = await getTranslations();

  const categories = await fetchCategories();

  if ("error" in categories) {
    throw new Error(categories.error);
  }

  if (categories.length === 0) {
    return (
      <Alert severity="error">{t("Global.Error.no_categories_found")}</Alert>
    );
  }

  const selectedCategoryId = categoryId || categories[0]?.id;
  const renderCategoriesFilter = (
    <CategoriesFilter categories={categories} initialCategoryId={categoryId} />
  );

  if (!selectedCategoryId) {
    return renderCategoriesFilter;
  }

  const subCategoryGroups = await fetchSubCategoriesWithProducts(
    selectedCategoryId,
    Number(page || "1"),
  );
  if ("error" in subCategoryGroups) {
    throw new Error(subCategoryGroups.error);
  }

  if (subCategoryGroups.length === 0) {
    return (
      <>
        {renderCategoriesFilter}
        <Alert severity="error">
          {t("Global.Error.no_subcategories_found")}
        </Alert>
      </>
    );
  }

  const subCategories = subCategoryGroups.map((group) => group.subcategory);
  const selectedSubCategoryId = subCategoryId || subCategories[0]?.id;

  const renderSubCategoriesFilter = (
    <SubCategoriesFilter
      subCategories={subCategories}
      initialSubCategoryId={selectedSubCategoryId}
    />
  );

  if (!selectedSubCategoryId) {
    return (
      <>
        {renderCategoriesFilter}
        {renderSubCategoriesFilter}
      </>
    );
  }

  const products =
    subCategoryGroups.find(
      (group) => group.subcategory.id === selectedSubCategoryId,
    )?.products || [];

  if (products.length === 0) {
    return (
      <>
        {renderCategoriesFilter}
        {renderSubCategoriesFilter}
        <Alert severity="warning">{t("Global.Error.no_products_found")}</Alert>
      </>
    );
  }

  return (
    <>
      {renderCategoriesFilter}
      {renderSubCategoriesFilter}
      <ProductsListView products={products} pagesCount={1} />
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
    title: t("Title.products"),
  };
}
