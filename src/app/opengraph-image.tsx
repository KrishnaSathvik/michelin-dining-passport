import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.productName} — ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadLogoDataUrl(): Promise<string> {
  const logoBytes = await readFile(
    join(process.cwd(), "public/brand/logo.png"),
  );
  return `data:image/png;base64,${Buffer.from(logoBytes).toString("base64")}`;
}

async function loadLiterata(): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      "https://fonts.googleapis.com/css2?family=Literata:wght@500;700&display=swap",
      {
        headers: {
          // Request a TTF-capable stylesheet for Satori/ImageResponse.
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
      },
    );
    if (!cssResponse.ok) return null;
    const css = await cssResponse.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/);
    const fontUrl = match?.[1];
    if (!fontUrl) return null;
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) return null;
    return fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const [logoSrc, literata] = await Promise.all([
    loadLogoDataUrl(),
    loadLiterata(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FCF9F8",
          backgroundImage:
            "radial-gradient(circle at 16% 50%, rgba(18, 59, 47, 0.04) 0%, transparent 40%), linear-gradient(135deg, #FCF9F8 0%, #F7F2EE 100%)",
          padding: "72px 80px",
          alignItems: "center",
        }}
      >
        <img
          src={logoSrc}
          width={300}
          height={300}
          alt=""
          style={{
            objectFit: "contain",
            marginRight: 48,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            maxWidth: 680,
          }}
        >
            <div
              style={{
                display: "flex",
                fontSize: 17,
                letterSpacing: "0.24em",
                color: "#5F6B66",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontWeight: 500,
                marginBottom: 18,
              }}
            >
              INDEPENDENT DINING GUIDE
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 92,
                fontWeight: 700,
                color: "#123B2F",
                letterSpacing: "0.06em",
                lineHeight: 1,
                fontFamily: literata ? "Literata" : "Georgia, serif",
                marginBottom: 22,
              }}
            >
              {siteConfig.wordmark}
            </div>
            <div
              style={{
                display: "flex",
                width: 72,
                height: 3,
                background: "#B88A2A",
                marginBottom: 22,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#123B2F",
                lineHeight: 1.3,
                fontFamily: literata ? "Literata" : "Georgia, serif",
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              {siteConfig.tagline}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: "#414845",
                lineHeight: 1.45,
                fontFamily: "Helvetica, Arial, sans-serif",
                maxWidth: 620,
              }}
            >
              Discover Michelin-starred restaurants across the United States.
            </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: literata
        ? [
            {
              name: "Literata",
              data: literata,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : [],
    },
  );
}
