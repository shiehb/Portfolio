// app/page.tsx
'use client';

import { useEffect, useRef } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import HorizontalScroll from "../components/HorizontalScroll";
import Projects from "../components/Projects";
import SmoothScrollWrapper from "@/components/SmoothScrollWrapper";
import { useLoading } from "@/lib/LoadingContext";

export default function Home() {
  const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Reset loading state when component mounts
    resetLoading();

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setTotalItems(2);

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
      if (img.complete) {
        onLoadOrError();
      } else {
        img.onload = onLoadOrError;
        img.onerror = onLoadOrError;
      }
    });

    const timer = setTimeout(() => {
      incrementLoaded();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [setTotalItems, incrementLoaded, resetLoading]);

  return (
    <SmoothScrollWrapper>
      <main className="min-h-screen text-white relative">
        <div className="relative z-10">
          <Hero />
          <About />
          <HorizontalScroll />
          <Projects />
        </div>
      </main>
    </SmoothScrollWrapper>
  );
}