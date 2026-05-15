"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { endpoints } from "@/utils/endpoints";
import { postData } from "@/utils/crud-fetch-api";

import { COOKIES_KEYS } from "@/config-global";

import { Address } from "@/types/profile";

interface RegisterBody {
  phone: string;
  name: string;
}
export async function register(body: RegisterBody) {
  const res = await postData<{ expiryTime: string }, RegisterBody>(
    endpoints.auth.register,
    body,
  );

  if ("error" in res) {
    return res;
  }

  cookies().set(COOKIES_KEYS.expiryTime, res.data.expiryTime, {
    expires: new Date(res.data.expiryTime),
  });
  return res.data;
}

export async function sendOtp(phone: string) {
  const res = await postData<
    { expiryTime: string },
    { username: string; role: "CLIENT"; type: "phone" }
  >(endpoints.auth.sendOtp, {
    username: phone,
    role: "CLIENT",
    type: "phone",
  });

  if ("error" in res) {
    return res;
  }

  cookies().set(COOKIES_KEYS.expiryTime, res.data.expiryTime, {
    expires: new Date(res.data.expiryTime),
  });
  return res.data;
}
export async function verifyOtp(reqBody: verifyOtpCredentials) {
  const res = await postData<verifyOtpResponse, any>(endpoints.auth.verifyOtp, {
    username: reqBody.phoneNumber,
    code: reqBody.otp,
    type: "phone",
  });

  if ("error" in res) {
    return res;
  }

  const { id, name, avatar, email, phone, access_token: token } = res.data;
  const user = { id, name, avatar, email, phone };

  cookies().set(COOKIES_KEYS.session, token);
  cookies().set(COOKIES_KEYS.user, JSON.stringify(user));

  return { ...user };
}

export async function logUserOut() {
  cookies().delete(COOKIES_KEYS.session);
  cookies().delete(COOKIES_KEYS.user);
  cookies().delete(COOKIES_KEYS.expiryTime);
  cookies().delete(COOKIES_KEYS.favAddress);
  revalidatePath("/", "layout");
}
export type verifyOtpCredentials = {
  phoneNumber: string;
  otp: string;
};
export interface User {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  id: string;
}
export type verifyOtpResponse = User & {
  access_token: string;
};

export async function saveFavAddress(
  address: Pick<Address, "latitude" | "longitude">,
  warehouseId?: string,
  deleteWarehouseId = false,
) {
  cookies().set(
    COOKIES_KEYS.favAddress,
    JSON.stringify({
      latitude: address.latitude,
      longitude: address.longitude,
    }),
  );
  if (warehouseId) {
    cookies().set(COOKIES_KEYS.warehouseId, warehouseId);
  } else if (deleteWarehouseId) {
    cookies().delete(COOKIES_KEYS.warehouseId);
  }
}
export async function getFavAddress(): Promise<Pick<
  Address,
  "latitude" | "longitude"
> | null> {
  const cookieAddress = cookies().get(COOKIES_KEYS.favAddress)?.value;
  return cookieAddress ? JSON.parse(cookieAddress) : null;
}
