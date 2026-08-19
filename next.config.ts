// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "ais-dev-pfjs22sj6qnnysmlx2vrkp-829392694658.asia-east1.run.app",
    "ais-pre-pfjs22sj6qnnysmlx2vrkp-829392694658.asia-east1.run.app",
    "*.run.app",
    "localhost:3000",
  ],
  images: {
    qualities: [75, 85],
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

  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@paper-design/shaders-react',
      'gsap',
      'lenis',
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
    ];
  },
};

export default nextConfig;