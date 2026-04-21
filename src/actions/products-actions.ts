"use server";

import { cookies } from "next/headers";

import { endpoints } from "@/utils/endpoints";
import { getData, postData } from "@/utils/crud-fetch-api";

import { COOKIES_KEYS, PRODUCTS_PER_PAGE } from "@/config-global";

import {
  Brand,
  Offer,
  Product,
  Section,
  Category,
  SubCategory,
  FullProduct,
  CategoryGroup,
  CollectionWithProducts,
} from "@/types/products";

import { getFavAddress } from "./auth-methods";

function appendFavAddressParams(
  searchParams: URLSearchParams,
  favAddress: { latitude: string; longitude: string } | null
) {
  if (!favAddress) return;
  searchParams.set("longitude", favAddress.longitude);
  searchParams.set("latitude", favAddress.latitude);
}

export async function fetchSections() {
  const sectionRes = await getData<Section[]>(endpoints.products.sections);
  if ("error" in sectionRes) {
    return sectionRes;
  }
  return sectionRes.data;
}

export async function fetchCategories() {
  const sectionRes = await fetchSections();
  if ("error" in sectionRes) {
    return sectionRes;
  }

  const sectionId = sectionRes[0]?.id;
  const categoriesRes = await getData<Category[]>(
    `${endpoints.products.categories(sectionId)}?all=false`
  );
  if ("error" in categoriesRes) {
    return categoriesRes;
  }
  return categoriesRes.data;
}

interface CategoryGroupsResponse {
  section: Section;
  section_categories: CategoryGroup[];
}
export async function fetchCategoryGroups() {
  const categoriesRes = await getData<CategoryGroupsResponse>(
    endpoints.products.categoryGroups
  );
  if ("error" in categoriesRes) {
    return categoriesRes;
  }
  return categoriesRes.data;
}

export async function fetchSubCategories(categoryId: string) {
  const res = await getData<SubCategory[]>(
    `${endpoints.products.subCategories(categoryId)}?all=false`
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchProductsBySubCategory(
  subCategoryId: string,
  page = 1
) {
  if (!subCategoryId) throw new Error("subCategoryId is required");
  const favAddress = await getFavAddress();

  const searchParams = new URLSearchParams({
    category_sub_category_id: subCategoryId,
    page: String(page),
    limit: String(PRODUCTS_PER_PAGE),
    sort: "new",
  });
  appendFavAddressParams(searchParams, favAddress);

  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.products}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return {
    items: res?.data?.data,
    pagesCount: Math.ceil(
      (res?.data?.meta?.itemCount || 0) / PRODUCTS_PER_PAGE
    ),
  };
}

export async function fetchProductsByBrand(brandId: string, page = 1) {
  const favAddress = await getFavAddress();

  const searchParams = new URLSearchParams({
    brand_id: brandId,
    page: String(page),
    limit: String(PRODUCTS_PER_PAGE),
    sort: "new",
  });
  appendFavAddressParams(searchParams, favAddress);
  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.products}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return {
    items: res?.data?.data,
    pagesCount: Math.ceil(
      (res?.data?.meta?.itemCount || 0) / PRODUCTS_PER_PAGE
    ),
  };
}

export async function fetchFavoriteProducts(page = 1) {
  const sectionRes = await fetchSections();
  if ("error" in sectionRes) {
    return sectionRes;
  }

  const user = JSON.parse(cookies().get(COOKIES_KEYS.user)?.value || "{}");

  const searchParams = new URLSearchParams({
    section_id: sectionRes[0]?.id,
    user_id: user.id || "",
    page: String(page),
    limit: String(PRODUCTS_PER_PAGE),
    sort: "new",
  });

  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.favoriteList}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return {
    items: res?.data?.data,
    pagesCount: Math.ceil(
      (res?.data?.meta?.itemCount || 0) / PRODUCTS_PER_PAGE
    ),
  };
}

export async function fetchOffers(page = 1, limit = PRODUCTS_PER_PAGE) {
  const cookieStore = await cookies();
  const user = cookieStore.get(COOKIES_KEYS.user)?.value;
  const userId = user ? JSON.parse(user).id : null;

  const sectionRes = await fetchSections();
  const sectionId = "error" in sectionRes ? undefined : sectionRes[0]?.id;
  const favAddress = await getFavAddress();

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: "new",
    section_id: sectionId || "",
    user_id: userId || "",
  });
  appendFavAddressParams(searchParams, favAddress);

  const res = await getData<{ data: Offer[]; meta: { itemCount: number } }>(
    `${endpoints.products.offers}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return {
    items: res?.data?.data,
    pagesCount: Math.ceil(
      (res?.data?.meta?.itemCount || 0) / PRODUCTS_PER_PAGE
    ),
  };
}

export async function fetchCollections() {
  const favAddress = await getFavAddress();
  const searchParams = new URLSearchParams({
    page: "1",
    limit: "1",
    latitude: favAddress?.latitude || "",
    longitude: favAddress?.longitude || "",
  });
  const res = await getData<{ collections: CollectionWithProducts[] }>(
    `${endpoints.products.collections}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }

  return res?.data?.collections;
}

export async function fetchProductsByCollection(
  collectionId: string,
  page = 1,
  limit = 50
) {
  if (!collectionId) throw new Error("collectionId is required");
  const favAddress = await getFavAddress();

  const searchParams = new URLSearchParams({
    collection_id: collectionId,
    page: String(page),
    limit: String(limit),
    sort: "new",
  });
  appendFavAddressParams(searchParams, favAddress);

  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.products}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }

  return {
    items: res?.data?.data,
    pagesCount: Math.ceil((res?.data?.meta?.itemCount || 0) / limit),
  };
}

export async function fetchSingleProduct(productId: string) {
  const user = JSON.parse(cookies().get(COOKIES_KEYS.user)?.value || "{}");
  const favAddress = await getFavAddress();

  const searchParams = new URLSearchParams({
    user_id: user.id || "",
  });
  appendFavAddressParams(searchParams, favAddress);

  const res = await getData<FullProduct>(
    `${endpoints.products.singleProduct}/${productId}?user_id=${user.id || ""}&latitude=${favAddress?.latitude || ""}&longitude=${favAddress?.longitude || ""}`
  );
  if ("error" in res) {
    if (res.status === 404) {
      throw new Error("product not found");
    }
    return res;
  }
  return res?.data;
}

export async function fetchBrands() {
  const favAddress = await getFavAddress();
  const searchParams = new URLSearchParams({
    latitude: favAddress?.latitude || "",
    longitude: favAddress?.longitude || "",
  });
  const res = await getData<Brand[]>(
    `${endpoints.products.brands}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function searchProducts(search: string) {
  const favAddress = await getFavAddress();
  const searchParams = new URLSearchParams({
    product_name: search,
    page: String(1),
    limit: String(10),
    sort: "new",
  });
  appendFavAddressParams(searchParams, favAddress);
  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.products}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }

  return res?.data?.data;
}

export async function fetchProducts(productName: string, page = "1") {
  const favAddress = await getFavAddress();
  const searchParams = new URLSearchParams({
    product_name: productName,
    page: String(page),
    limit: String(PRODUCTS_PER_PAGE),
    sort: "new",
  });
  appendFavAddressParams(searchParams, favAddress);
  const res = await getData<{ data: Product[]; meta: { itemCount: number } }>(
    `${endpoints.products.products}?${searchParams.toString()}`
  );

  if ("error" in res) {
    return res;
  }
  return {
    items: res?.data?.data,
    pagesCount: Math.ceil(
      (res?.data?.meta?.itemCount || 0) / PRODUCTS_PER_PAGE
    ),
  };
}

export async function toggleFavorite({
  productId,
  sectionId,
}: {
  productId: string;
  sectionId: string;
}) {
  const res = await postData<any, {}>(
    endpoints.products.favorite({ productId, sectionId }),
    {}
  );

  if ("error" in res) {
    return res;
  }

  return res;
}
