import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  poweredByHeader: false,
  // Pin the workspace root so Turbopack doesn't pick a stray parent lockfile
  // (e.g. ~/package-lock.json) and fail to resolve tailwindcss / other deps.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
