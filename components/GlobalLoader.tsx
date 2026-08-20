// components/GlobalLoader.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import { CutoutPixelSmiley } from '@/components/TransitionShapes';
import gsap from 'gsap';

export default function GlobalLoader() {
  const { isLoading, isTransitioning } = useLoading();
  const [mounted, setMounted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const solidBgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cutoutContainerRef = useRef<HTMLDivElement>(null);
  const isAnimatingOut = useRef(false);

  // Trigger Outro Zoom-In animation ONLY after all preloading is fully completed (isLoading === false)
  useEffect(() => {
    if (isLoading || isTransitioning || isAnimatingOut.current || !mounted) {
      return;
    }

    if (!containerRef.current) return;
    isAnimatingOut.current = true;

    const solidBg = solidBgRef.current;
    const content = contentRef.current;
    const cutoutContainer = cutoutContainerRef.current;
    const container = containerRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false);
      },
    });

    // 1. Fade out brand text smoothly
    if (content) {
      tl.to(content, {
        opacity: 0,
        scale: 0.9,
        duration: 0.18,
        ease: 'power2.in',
      });
    }

    // 2. Activate cutout shape mask
    // Cutout mask's outer bounds provide the solid #fd551d orange backdrop,
    // while the center pixel smiley is a true transparent hole revealing the preloaded page underneath.
    tl.add(() => {
      if (solidBg) gsap.set(solidBg, { opacity: 0 });
      if (cutoutContainer) gsap.set(cutoutContainer, { opacity: 1, scale: 0.85 });
    });

    // 3. Zoom in the inverted pixel smiley cutout mask - transparent hole expands outward to reveal page
    if (cutoutContainer) {
      tl.fromTo(
        cutoutContainer,
        {
          scale: 0.85,
          opacity: 1,
        },
        {
          scale: 45,
          duration: 0.62,
          ease: 'power3.inOut',
        }
      );
    }

    // 4. Fade out overlay container at the very end
    if (container) {
      tl.to(
        container,
        {
          opacity: 0,
          duration: 0.08,
        },
        '>-0.06'
      );
    }
  }, [isLoading, isTransitioning, mounted]);

  // If unmounted or explicit page transition active, remove from DOM
  if (!mounted || isTransitioning) return null;

  return (
    <div
      ref={containerRef}
      id="global-preloader"
      aria-label="Loading"
      className="global-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-transparent text-white select-none overflow-hidden will-change-[transform,opacity]"
      style={{
        transformOrigin: 'center center',
      }}
    >
      {/* Solid Orange backdrop during initial loading - exact match with menu transition */}
      <div
        ref={solidBgRef}
        className="absolute inset-0 bg-[#fd551d]"
      />

      {/* Outro Pixel Smiley Cutout Layer (Zooms in to reveal fully preloaded page) */}
      <div
        ref={cutoutContainerRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <CutoutPixelSmiley color="#fd551d" />
        </div>
      </div>

      {/* Main Brand Content: White @echo_.ng text - exact match with menu transition */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center gap-3 px-4 text-center"
      >
        <span className="font-display tracking-[0.24em] text-xl sm:text-2xl font-bold uppercase text-white drop-shadow-md">
          @echo_.ng
        </span>
      </div>
    </div>
  );
}
