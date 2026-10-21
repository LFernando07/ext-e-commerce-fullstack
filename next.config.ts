import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dragonball-api.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  // Suprime logs de source maps durante desarrollo si no hay token de autenticación configurado
  silent: true,
  org: process.env.SENTRY_ORG || "zenithenterprice",
  project: process.env.SENTRY_PROJECT || "ext-e-commerce-fullstack-public",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
});
