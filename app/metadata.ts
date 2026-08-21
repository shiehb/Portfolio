import type { Metadata, Viewport } from "next";

export const viewportConfig: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
  colorScheme: "dark",
};

export const siteMetadata: Metadata = {
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