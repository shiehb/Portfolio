// app/page.tsx
'use client';

import { Suspense, lazy, useEffect, useState } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import SmoothScroll from "../components/SmoothScroll";
import Loading from "./loading";

// Lazy load components
const LazyHorizontalScroll = lazy(() => import("../components/HorizontalScroll"));
const LazyProjects = lazy(() => import("../components/Projects"));

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
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
      <main className="min-h-screen bg-[#222222] text-white">
        <Hero />
        <About />
        
        <Suspense fallback={<Loading />}>
          <LazyHorizontalScroll />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <LazyProjects />
        </Suspense>
      </main>
    </SmoothScroll>
  );
}