import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Literata } from "next/font/google";
import { AppChrome } from "@/components/shell/AppChrome";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { PassportClientShell } from "@/components/passport/PassportClientShell";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getVerifiedUser } from "@/lib/auth/session";
import { getRestaurants } from "@/lib/data/restaurants";
import "./globals.css";

/** OD-03: Literata is the only display font. Instrument Serif removed. */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
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
    default: `${siteConfig.productName} — The Guide to Remarkable Dining`,
    template: `%s | ${siteConfig.productName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.productName,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/brand/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    siteName: siteConfig.productName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.productName} — The Guide to Remarkable Dining`,
    description: siteConfig.description,
  },
};

/**
 * Lock layout scale on phones so pinch-zoom does not break the reading shell.
 * Note: this reduces accessibility for users who rely on browser zoom.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#123b2f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const restaurants = getRestaurants();
  const user = await getVerifiedUser().catch(() => null);

  return (
    <html
      lang="en"
      className={`${literata.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <PassportClientShell restaurants={restaurants}>
          <AppChrome user={user} footer={<SiteFooter />}>
            {children}
          </AppChrome>
        </PassportClientShell>
      </body>
    </html>
  );
}
