import type { ReactNode } from "react";
import type { Metadata } from "next";
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
