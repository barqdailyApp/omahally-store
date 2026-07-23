"use server";

import { endpoints } from "@/utils/endpoints";
import {
  getData,
  postData,
  editData,
  deleteData,
} from "@/utils/crud-fetch-api";

import { FullCart, PromoCode, CartProduct } from "@/contexts/cart-store";

import { DeliveryType } from "@/types/profile";
import { Payment, TimeSlot } from "@/types/cart";

export async function fetchCartProducts() {
  const res = await getData<CartProduct[]>(endpoints.cart.fetchProducts);

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchFullCart() {
  const res = await getData<FullCart>(endpoints.cart.withWarehouse);

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchCartProductById(cart_product_id: string) {
  const res = await getData<CartProduct>(
    endpoints.cart.fetchProductById(cart_product_id),
  );

  if ("error" in res) {
    return res;
  }

  return res?.data;
}

export async function addProductToCart(body: {
  product_category_price_id: string;
  options: string[];
  quantity?: number;
}) {
  const payload = {
    ...body,
    quantity: body.quantity ?? 1,
  };
  const res = await postData<CartProduct, typeof payload>(
    `${endpoints.cart.add}`,
    payload,
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function removeCartProduct(cart_product_id: string) {
  const res = await deleteData<any>(endpoints.cart.delete(cart_product_id));

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function clearCart() {
  const res = await deleteData<any>(endpoints.cart.clear);

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function updateCartProduct(
  cart_product_id: string,
  quantity: number,
) {
  const res = await editData<
    CartProduct,
    {
      cart_product_id: string;
      quantity: number;
    }
  >(endpoints.cart.update, "PUT", { cart_product_id, quantity });

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function updateCartProductOptions(
  cart_product_id: string,
  options: string[],
) {
  const res = await editData<
    CartProduct,
    {
      cart_product_id: string;
      options: string[];
    }
  >(endpoints.cart.update, "PUT", { cart_product_id, options });

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchTimeSlots({
  delivery_day,
  deliveryType,
  warehouseId,
}: {
  delivery_day: string;
  deliveryType: DeliveryType;
  warehouseId?: string | null;
}) {
  const delivery = deliveryType === "SCHEDULED" ? "true" : "false";

  const res = await getData<TimeSlot[]>(
    `${endpoints.cart.timeSlots(delivery_day)}?delivery=${delivery}${
      deliveryType === "WAREHOUSE_PICKUP" && warehouseId
        ? `&warehouse_id=${warehouseId}`
        : ""
    }`,
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchPayments() {
  const res = await getData<Payment[]>(endpoints.cart.listPayments);

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export interface CreateOrderBody {
  section_id: string;
  promo_code?: string;
  note: string;
  wallet_discount: number;
  payment_method: {
    payment_method_id: string;
    transaction_number?: string;
    wallet_number: null;
  };
  delivery_type: string;
  slot_day: {
    slot_id: string;
    day: string;
  };
}
export async function createOrder(body: CreateOrderBody) {
  const res = await postData<any, CreateOrderBody & { platform: "WEB" }>(
    `${endpoints.cart.createOrder}`,
    { ...body, platform: "WEB" },
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}

export async function fetchPromoCode(code: string, paymentMethodId: string) {
  const res = await getData<PromoCode>(
    endpoints.cart.fetchPromoCode(code, paymentMethodId),
  );

  if ("error" in res) {
    return res;
  }
  return res?.data;
}
