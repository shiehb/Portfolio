// components/GlobalLoader.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import gsap from 'gsap';

export default function GlobalLoader() {
  const { isLoading, progress, isTransitioning, hasInitialLoaded } = useLoading();
  const [mounted, setMounted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingOut = useRef(false);

  // Handle zoom-in exit animation when loading completes
  useEffect(() => {
    if (hasInitialLoaded || isTransitioning) {
      return;
    }

    if (!isLoading && !isAnimatingOut.current && containerRef.current) {
      isAnimatingOut.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          setMounted(false);
        },
      });

      // Zoom in transition effect when content is ready
      tl.to(containerRef.current, {
        scale: 1.3,
        opacity: 0,
        borderRadius: '0px',
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }
  }, [isLoading, isTransitioning, hasInitialLoaded]);

  // If initial load already completed, or transitioning, don't show loader at all
  if (hasInitialLoaded || isTransitioning || !mounted) return null;

  const displayProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      ref={containerRef}
      id="global-preloader"
      aria-label="Loading"
      className="global-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#181818] text-white select-none overflow-hidden will-change-[transform,opacity]"
      style={{
        transformOrigin: 'center center',
      }}
    >
      <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Custom Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-display tracking-[0.25em] text-sm sm:text-base font-bold uppercase text-white">
            JERICHO URBANO
          </span>
          <span className="text-[11px] tracking-[0.2em] text-white/50 uppercase font-mono">
            PORTFOLIO
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-44 sm:w-52 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#fd551d] transition-all duration-200 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Counter Number */}
        <div className="font-mono text-xs text-white/60 tracking-wider">
          {displayProgress.toString().padStart(2, '0')}%
        </div>
      </div>
    </div>
  );
}
