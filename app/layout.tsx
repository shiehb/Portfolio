// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingProvider } from "@/lib/LoadingContext";
import GlobalLoader from "@/components/GlobalLoader";
import PaperShaderWrapper from "@/components/PaperShaderWrapper";

// Load custom font with swap - CORRECTED PATH
const departureMono = localFont({
  src: "../public/font/departure-mono.otf", // Try this path
  // OR if the file is in the root of public:
  // src: "../../public/font/departure-mono.otf",
  display: "swap",
  variable: "--font-display",
  fallback: ["SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "Jericho | Portfolio",
  description: "Personal portfolio website built with Next.js",
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
      <body className="min-h-full flex flex-col relative">
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