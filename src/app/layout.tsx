import { Metadata } from "next";

import "./globals.css";

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Omahally",
  description: "متجر للمنتجات الغذائية",
  keywords: "Omahally, store, Yemen",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/logo/logo-230-230.png" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/logo/logo-230-230.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/logo/logo-230-230.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/logo/logo-230-230.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
