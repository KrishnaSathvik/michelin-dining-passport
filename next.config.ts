import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every response.
 *
 * Intentionally NOT a Content-Security-Policy yet: a correct CSP for this app
 * must allowlist Supabase, the CARTO basemap CDN, the Google Maps JS bootstrap
 * (nonce-based), and next/font Google fonts. Shipping an incomplete CSP would
 * silently break the map, auth, or fonts in production, so it is a deliberate
 * follow-up rather than a guess here.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    // Only meaningful over HTTPS (Vercel serves HTTPS); ignored on http://localhost.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Playwright and local tooling often use 127.0.0.1 while `next dev` binds as localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Do not advertise the framework version to attackers.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
