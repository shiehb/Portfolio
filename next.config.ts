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
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    // Remove console.log in production (optional)
    // removeConsole: process.env.NODE_ENV === 'production' ? {
    //   exclude: ['error', 'warn'],
    // } : false,
  },

  reactStrictMode: true,
  poweredByHeader: false,

  // Conditionally enable experimental features
  experimental: {
    // Only enable optimizeCss if critters is installed
    optimizeCss: process.env.NODE_ENV === 'production',
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@paper-design/shaders-react',
    ],
  },

  turbopack: {
    resolveAlias: {},
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    debugIds: process.env.NODE_ENV === 'development',
    rules: {},
  },

  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        source: '/img/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/font/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;