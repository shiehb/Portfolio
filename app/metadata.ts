import type { Metadata, Viewport } from "next";

export const viewportConfig: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
  colorScheme: "dark",
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const siteMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Jericho Urbano | Portfolio",
    template: "%s | Jericho Urbano",
  },
  description: "Visual Artist & Web Developer Portfolio.",
  openGraph: {
    title: "Jericho Urbano",
    description: "Visual Artist & Web Developer.",
    type: "website",
    images: ["/img/hero.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jericho Urbano",
    description: "Visual Artist & Web Developer.",
    images: ["/img/hero.webp"],
  },
};
