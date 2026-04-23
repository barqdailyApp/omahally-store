"use client";

import CategoriesLoading from "@/sections/products/loading/categories-loading";
import ProductsListLoading from "@/sections/products/loading/products-list-loading";
import SubCategoriesLoading from "@/sections/products/loading/subCategories-loading";

// ----------------------------------------------------------------------

export default function Loading() {
  return (
    <>
      <CategoriesLoading />
      <SubCategoriesLoading />
      <ProductsListLoading />
    </>
  );
}
