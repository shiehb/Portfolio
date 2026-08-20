// components/PageTransition.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/lib/LoadingContext';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const currentPath = useRef(pathname);
  const isTransitioningRef = useRef(false);
  const { startTransition, endTransition } = useLoading();

  // Handle manual transitions from navbar, footer, or projects
  useEffect(() => {
    const handlePageTransition = (e: CustomEvent) => {
      if (!overlayRef.current || isTransitioningRef.current) return;

      const overlay = overlayRef.current;
      const callback = e.detail?.callback;

      isTransitioningRef.current = true;
      
      // Tell context we're transitioning - this hides GlobalLoader
      startTransition();

      // Reset overlay state - start fully visible with zoom-out
      gsap.set(overlay, {
        scale: 1.3,
        opacity: 0,
        borderRadius: '0px',
        display: 'flex',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          isTransitioningRef.current = false;
          // End transition after animation completes
          endTransition();
          if (callback) callback();
        }
      });

      // 1. Zoom out to cover screen (matching loading screen style)
      tl.to(overlay, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });

      // 2. Short hold
      tl.to({}, { duration: 0.2 });

      // 3. Zoom in to reveal new page content
      tl.to(overlay, {
        scale: 1.3,
        opacity: 0,
        borderRadius: '0px',
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
        },
      });
    };

    window.addEventListener('pageTransition', handlePageTransition as EventListener);
    return () => window.removeEventListener('pageTransition', handlePageTransition as EventListener);
  }, [startTransition, endTransition]);

  // Automatic transition for route changes
  useEffect(() => {
    // Skip first load since GlobalLoader handles initial load / reload
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      currentPath.current = pathname;
      return;
    }

    if (currentPath.current === pathname) return;
    currentPath.current = pathname;

    if (!overlayRef.current) return;

    const overlay = overlayRef.current;

    // Tell context we're transitioning
    startTransition();

    // Timeline for page transition with zoom-in effect
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        endTransition();
      }
    });

    // 1. Reset overlay scale and opacity
    gsap.set(overlay, {
      scale: 1.3,
      opacity: 0,
      borderRadius: '0px',
      display: 'flex',
    });

    // 2. Zoom out to cover screen
    tl.to(overlay, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        // Reset scroll position to top
        window.scrollTo(0, 0);
      },
    });

    // 3. Short hold for target page to render
    tl.to({}, { duration: 0.2 });

    // 4. Zoom in smoothly to reveal new page content
    tl.to(overlay, {
      scale: 1.3,
      opacity: 0,
      borderRadius: '0px',
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
      },
    });

    return () => {
      tl.kill();
      endTransition();
    };
  }, [pathname, startTransition, endTransition]);

  return (
    <div
      ref={overlayRef}
      id="page-transition-overlay"
      className="page-transition-overlay fixed inset-0 z-[99999] hidden flex-col items-center justify-center bg-[#181818] text-white pointer-events-none will-change-[transform,opacity] select-none"
      style={{ transformOrigin: 'center center' }}
    >
      {/* Matching loading screen style */}
      <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Logo / Title matching GlobalLoader */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-display tracking-[0.25em] text-sm sm:text-base font-bold uppercase text-white">
            JERICHO URBANO
          </span>
          <span className="text-[11px] tracking-[0.2em] text-white/50 uppercase font-mono">
            PORTFOLIO
          </span>
        </div>

        {/* Progress Bar matching GlobalLoader */}
        <div className="w-44 sm:w-52 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#fd551d] transition-all duration-200 ease-out"
            style={{ width: '100%' }}
          />
        </div>

        {/* Counter matching GlobalLoader */}
        <div className="font-mono text-xs text-white/60 tracking-wider">
          100%
        </div>
      </div>
    </div>
  );
}