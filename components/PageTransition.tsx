// components/PageTransition.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/lib/LoadingContext';
import { PageTransitionDetail } from '@/lib/transitionEvents';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const isFirstLoad = useRef(true);
  const currentPath = useRef(pathname);
  const isTransitioningRef = useRef(false);
  const [destTitle, setDestTitle] = useState<string>("PORTFOLIO");
  const { startTransition, endTransition } = useLoading();

  const getPageTitle = (path?: string) => {
    if (!path) return "PORTFOLIO";
    if (path === "/" || path === "") return "HOME";
    if (path.includes("/about")) return "ABOUT";
    if (path.includes("/projects")) return "PROJECTS";
    if (path.includes("/contact")) return "CONTACT";
    return path.replace("/", "").toUpperCase();
  };

  // Handle manual transitions from navbar, footer, or project cards
  useEffect(() => {
    const handlePageTransition = (e: CustomEvent<PageTransitionDetail>) => {
      if (!overlayRef.current || isTransitioningRef.current) return;

      const overlay = overlayRef.current;
      const callback = e.detail?.callback;
      const targetHref = e.detail?.targetHref;
      const customTitle = e.detail?.title || getPageTitle(targetHref);

      setDestTitle(customTitle);
      isTransitioningRef.current = true;
      
      // Tell context we're transitioning - guarantees GlobalLoader is permanently suppressed
      startTransition();

      // Reset overlay state - start slightly scaled down and transparent
      gsap.killTweensOf(overlay);
      gsap.set(overlay, {
        scale: 0.88,
        opacity: 0,
        filter: 'blur(4px)',
        display: 'flex',
        pointerEvents: 'auto',
      });

      if (barRef.current) {
        gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          isTransitioningRef.current = false;
          gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
          endTransition();
        }
      });

      // 1. Zoom in to cover the entire screen
      tl.to(overlay, {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.32,
        ease: 'power3.out',
      });

      if (barRef.current) {
        tl.to(barRef.current, {
          scaleX: 1,
          duration: 0.28,
          ease: 'power2.out',
        }, '<0.05');
      }

      // 2. Perform route transition & scroll reset while screen is covered
      tl.add(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (callback) {
          callback();
        }
      });

      // 3. Short hold so target page DOM hydrates smoothly
      tl.to({}, { duration: 0.12 });

      // 4. Fullscreen zoom-in reveal animation
      tl.to(overlay, {
        scale: 1.35,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      });
    };

    window.addEventListener('pageTransition', handlePageTransition as EventListener);
    return () => window.removeEventListener('pageTransition', handlePageTransition as EventListener);
  }, [startTransition, endTransition]);

  // Fallback for browser back/forward buttons or direct router navigation
  useEffect(() => {
    // Skip initial site boot since GlobalLoader handles first visit
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      currentPath.current = pathname;
      return;
    }

    if (currentPath.current === pathname) return;
    currentPath.current = pathname;

    // If manual transition is already active, it will handle it
    if (isTransitioningRef.current || !overlayRef.current) return;

    const overlay = overlayRef.current;
    setDestTitle(getPageTitle(pathname));

    startTransition();

    gsap.killTweensOf(overlay);
    gsap.set(overlay, {
      scale: 1,
      opacity: 1,
      display: 'flex',
      pointerEvents: 'auto',
    });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        endTransition();
      }
    });

    tl.to(overlay, {
      scale: 1.35,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.inOut',
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
      className="page-transition-overlay fixed inset-0 z-[99999] hidden flex-col items-center justify-center bg-[#181818] text-white pointer-events-none will-change-[transform,opacity,filter] select-none"
      style={{ transformOrigin: 'center center' }}
    >
      <div className="flex flex-col items-center justify-center gap-5 px-4 text-center">
        {/* Brand & Subtitle */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display tracking-[0.28em] text-sm sm:text-base font-bold uppercase text-white">
            JERICHO URBANO
          </span>
          <span
            ref={titleRef}
            className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#fd551d] uppercase font-mono font-semibold"
          >
            {destTitle}
          </span>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-36 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div 
            ref={barRef}
            className="h-full w-full bg-[#fd551d]"
          />
        </div>
      </div>
    </div>
  );
}
