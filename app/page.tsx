// app/page.tsx
'use client';

import { Suspense, lazy, useEffect, useRef } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import SmoothScroll from "../components/SmoothScroll";
import { useLoading } from "@/lib/LoadingContext";

// Lazy load components
const LazyHorizontalScroll = lazy(() => import("../components/HorizontalScroll"));
const LazyProjects = lazy(() => import("../components/Projects"));

export default function Home() {
  const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Reset loading state when component mounts
    resetLoading();

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setTotalItems(4);

    let loadedCount = 0;
    const totalImages = 2;

    const images = [
      '/img/hero.webp',
      '/img/logo.png',
    ];

    images.forEach(src => {
      const img = new window.Image();
      img.src = src;
      const onLoadOrError = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          incrementLoaded();
        }
      };
      img.onload = onLoadOrError;
      img.onerror = onLoadOrError;
    });

    const timer = setTimeout(() => {
      incrementLoaded();
    }, 500);

    const timer2 = setTimeout(() => {
      incrementLoaded();
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [setTotalItems, incrementLoaded, resetLoading]);

  return (
    <SmoothScroll>
      <main className="min-h-screen text-white relative">
        <div className="relative z-10">
          <Hero />
          <About />

          <Suspense fallback={null}>
            <LazyHorizontalScroll />
          </Suspense>

          <Suspense fallback={null}>
            <LazyProjects />
          </Suspense>
        </div>
      </main>
    </SmoothScroll>
  );
}