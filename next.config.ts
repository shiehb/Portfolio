// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.codepen.io",
        port: "",
        pathname: "/**",
      },
    ],
    qualities: [75, 85, 90, 95, 100],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;