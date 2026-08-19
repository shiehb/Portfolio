// app/layout.tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingProvider } from "@/lib/LoadingContext";
import GlobalLoader from "@/components/GlobalLoader";
import PaperShaderWrapper from "@/components/PaperShaderWrapper";

// Load custom font with swap display for optimal FCP and CLS
const departureMono = localFont({
  src: "../public/font/departure-mono.otf",
  display: "swap",
  variable: "--font-display",
  fallback: ["SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#222222",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "Jericho Urbano | Visual Artist & Web Developer",
    template: "%s | Jericho Urbano",
  },
  description: "Portfolio of Jericho Urbano - Visual Artist & Web Developer specializing in immersive digital experiences, interactive web applications, videography, and narrative aesthetics.",
  keywords: [
    "Jericho Urbano",
    "Visual Artist",
    "Web Developer",
    "Creative Technologist",
    "Next.js Portfolio",
    "GSAP Animations",
    "Interactive Design",
    "Frontend Developer",
  ],
  authors: [{ name: "Jericho Urbano" }],
  creator: "Jericho Urbano",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Jericho Urbano | Visual Artist & Web Developer",
    description: "Specializing in immersive digital experiences, interactive web applications, and narrative aesthetics.",
    type: "website",
    locale: "en_US",
    siteName: "Jericho Urbano Portfolio",
    images: [
      {
        url: "/img/hero.webp",
        width: 1200,
        height: 630,
        alt: "Jericho Urbano Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jericho Urbano | Visual Artist & Web Developer",
    description: "Specializing in immersive digital experiences, interactive web applications, and narrative aesthetics.",
    images: ["/img/hero.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${departureMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col relative">
        <LoadingProvider>
          <GlobalLoader />
          <PaperShaderWrapper />
          <div className="relative z-10 flex flex-col min-h-full">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LoadingProvider>
      </body>
    </html>
  );
}