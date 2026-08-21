import type { Metadata, Viewport } from "next";

export const viewportConfig: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
  colorScheme: "dark",
};

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return "https://portfolio-jerichourbano.vercel.app";
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
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
};