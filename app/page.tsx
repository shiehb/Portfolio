// app/page.tsx
'use client';

import { Suspense, lazy, useEffect, useState } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import SmoothScroll from "../components/SmoothScroll";
import Loading from "./loading";
// REMOVE: import PaperShader from "@/components/PaperShader";

// Lazy load components
const LazyHorizontalScroll = lazy(() => import("../components/HorizontalScroll"));
const LazyProjects = lazy(() => import("../components/Projects"));

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SmoothScroll>
      <main className="min-h-screen  text-white relative">
        <div className="relative z-10">
          <Hero />
          <About />
          
          <Suspense fallback={<Loading />}>
            <LazyHorizontalScroll />
          </Suspense>
          
          <Suspense fallback={<Loading />}>
            <LazyProjects />
          </Suspense>
        </div>
      </main>
    </SmoothScroll>
  );
}