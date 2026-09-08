import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.openbeautyfacts.org" },
      { protocol: "https", hostname: "**.openfoodfacts.org" },
    ],
  },
};

export default nextConfig;
