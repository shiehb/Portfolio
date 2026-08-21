import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingProvider } from "@/lib/LoadingContext";
import GlobalLoader from "@/components/GlobalLoader";
import PaperShaderWrapper from "@/components/PaperShaderWrapper";
import PageTransition from "@/components/PageTransition";
import { Suspense } from "react";
import { siteMetadata, viewportConfig } from "@/app/metadata";

const departureMono = localFont({
  src: "../public/font/departure-mono.otf",
  display: "swap",
  variable: "--font-display",
  fallback: ["SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
  preload: true,
});

export const viewport: Viewport = viewportConfig;
export const metadata: Metadata = siteMetadata;

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
      <head>
        <link rel="preload" as="image" href="/img/hero.webp" />
        <link rel="preload" as="image" href="/img/logo.png" />
        <link rel="preload" as="font" href="/font/departure-mono.otf" type="font/otf" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
              }
            `,
          }}
        />
        <style>{`
          body { background-color: #222222; }
          .page-transition-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background-color: transparent !important;
            pointer-events: none;
            opacity: 0;
            display: none;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col relative">
        <LoadingProvider>
          <GlobalLoader />
          <PaperShaderWrapper />
          <PageTransition />
          <div className="relative z-10 flex flex-col min-h-full">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </div>
        </LoadingProvider>
      </body>
    </html>
  );
}