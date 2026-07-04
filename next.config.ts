import type { NextConfig } from "next";
import withPWAInit, { runtimeCaching } from "@ducanh2912/next-pwa";
import type { RuntimeCaching } from "workbox-build";

const isHttpUrl = (url: string | URL | Request) => {
  try {
    const u = typeof url === "string" || url instanceof URL ? new URL(url.toString()) : new URL(url.url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    runtimeCaching: [
      ...(runtimeCaching.map((entry) => ({
        ...entry,
        urlPattern: entry.urlPattern instanceof RegExp
          ? ((opts: { url: URL }) => isHttpUrl(opts.url) && (entry.urlPattern as RegExp).test(opts.url.href))
          : entry.urlPattern,
      })) as RuntimeCaching[]),
      {
        urlPattern: /^https:\/\/deeny-4ty6\.onrender\.com\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60,
          },
        },
      },
      {
        urlPattern: /\.(?:js|css|woff2|png|jpg|svg|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: process.env.CAPACITOR_BUILD === "true" ? "export" : "standalone",
  turbopack: {},
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
    {
      source: "/manifest.json",
      headers: [
        { key: "Cache-Control", value: "public, max-age=3600" },
        { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
      ],
    },
    {
      source: "/icons/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=86400, immutable" },
      ],
    },
  ],
};

export default withPWA(nextConfig);
