import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { COOKIES_KEYS } from "@/config-global";

export default async function middleware(request: NextRequest) {
  request.headers.set("Accept-Language", "ar");

  const handleI18nRouting = createMiddleware({
    locales: ["ar", "en"],
    defaultLocale: "ar",
  });
  const response = handleI18nRouting(request);

  const hasTenantCookie = request.cookies.has(COOKIES_KEYS.tenantId);

  if (!hasTenantCookie) {
    const isHttps = request.nextUrl.protocol === "https:";
    let tenantId: string | undefined;

    if (!isHttps) {
      tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    } else {
      const domain = request.nextUrl.hostname;
      const apiBase = process.env.NEXT_PUBLIC_HOST_API;
      try {
        const res = await fetch(`${apiBase}tenant/theme-by-domain/${domain}`);
        if (res.ok) {
          const json = await res.json();
          tenantId = json?.data?.tenant_id;
        }
      } catch {
        // proceed without setting the cookie if the request fails
      }
    }

    if (tenantId) {
      (response as NextResponse).cookies.set(COOKIES_KEYS.tenantId, tenantId, {
        path: "/",
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(ar|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
