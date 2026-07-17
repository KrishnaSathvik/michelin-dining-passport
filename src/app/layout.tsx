import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { SiteFooterGate } from "@/components/layout/SiteFooterGate";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PassportClientShell } from "@/components/passport/PassportClientShell";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getRestaurants } from "@/lib/data/restaurants";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: siteConfig.productName,
    template: `%s · ${siteConfig.productName}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.productName,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const restaurants = getRestaurants();

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <PassportClientShell restaurants={restaurants}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooterGate />
        </PassportClientShell>
      </body>
    </html>
  );
}
