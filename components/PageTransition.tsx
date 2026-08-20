// components/PageTransition.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/lib/LoadingContext';
import { PageTransitionDetail } from '@/lib/transitionEvents';
import { FilledPixelSmiley, CutoutPixelSmiley } from '@/components/TransitionShapes';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const solidBgRef = useRef<HTMLDivElement>(null);
  const introShapeRef = useRef<HTMLDivElement>(null);
  const outroCutoutRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);

  const isFirstLoad = useRef(true);
  const currentPath = useRef(pathname);
  const isTransitioningRef = useRef(false);
  const pendingOutroRef = useRef(false);
  const outroTriggeredRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { startTransition, endTransition } = useLoading();

  // Execute Outro: Inverted Pixel Smiley Transparency Mask zooms in to reveal the loaded page
  const playOutroAnimation = useCallback(() => {
    if (!overlayRef.current || outroTriggeredRef.current) return;
    outroTriggeredRef.current = true;
    pendingOutroRef.current = false;

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    const overlay = overlayRef.current;
    const solidBg = solidBgRef.current;
    const outroCutout = outroCutoutRef.current;
    const brandText = brandTextRef.current;
    const introShape = introShapeRef.current;

    if (introShape) gsap.set(introShape, { display: 'none' });

    // Scroll to top immediately when new page is mounted
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
        outroTriggeredRef.current = false;
        gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        endTransition();
      },
    });

    // 1. Fade out brand text
    if (brandText) {
      tl.to(brandText, {
        opacity: 0,
        scale: 0.9,
        duration: 0.16,
        ease: 'power2.in',
      });
    }

    // 2. Activate cutout shape mask
    // Cutout mask provides the outer #fd551d orange backdrop,
    // and the center pixel smiley is a true 100% transparent hole revealing the new destination page.
    tl.add(() => {
      if (solidBg) gsap.set(solidBg, { opacity: 0 });
      if (outroCutout) gsap.set(outroCutout, { opacity: 1, scale: 0.85 });
    });

    // 3. Zoom in the inverted pixel smiley cutout mask - transparent hole expands outward to reveal page
    if (outroCutout) {
      tl.to(outroCutout, {
        scale: 45,
        duration: 0.62,
        ease: 'power3.inOut',
      });
    }

    // 4. Clean fade out of overlay container at the very end
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.08,
      },
      '>-0.06'
    );
  }, [endTransition]);

  // Handle explicit transitions from navbar, footer, project cards, TransitionLink, etc.
  useEffect(() => {
    const handlePageTransition = (e: CustomEvent<PageTransitionDetail>) => {
      if (!overlayRef.current || isTransitioningRef.current) return;

      const overlay = overlayRef.current;
      const callback = e.detail?.callback;

      isTransitioningRef.current = true;
      pendingOutroRef.current = true;
      outroTriggeredRef.current = false;

      startTransition();

      // Elements
      const solidBg = solidBgRef.current;
      const introShape = introShapeRef.current;
      const outroCutout = outroCutoutRef.current;
      const brandText = brandTextRef.current;

      // Kill any running animations
      gsap.killTweensOf([overlay, solidBg, introShape, outroCutout, brandText]);

      // Reset initial states
      gsap.set(overlay, { display: 'flex', pointerEvents: 'auto', opacity: 1 });
      if (solidBg) gsap.set(solidBg, { opacity: 0 });
      if (introShape) gsap.set(introShape, { scale: 0.1, opacity: 1, display: 'flex' });
      if (outroCutout) gsap.set(outroCutout, { scale: 0.85, opacity: 0, display: 'flex' });
      if (brandText) gsap.set(brandText, { opacity: 0, scale: 0.85 });

      const tl = gsap.timeline();

      // --- 1. INTRO: Filled Pixel Smiley zooms in to cover the screen in #fd551d orange ---
      if (introShape) {
        tl.to(introShape, {
          scale: 36,
          duration: 0.4,
          ease: 'power3.in',
        });
      }

      // Switch to solid background once shape covers viewport
      if (solidBg) {
        tl.set(solidBg, { opacity: 1 });
      }
      if (introShape) {
        tl.set(introShape, { display: 'none' });
      }

      // --- 2. HOLD & ROUTER TRIGGER: Display @echo_.ng in crisp white text ---
      if (brandText) {
        tl.to(brandText, {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      }

      // Trigger Next.js router navigation while screen is fully covered in solid orange
      tl.add(() => {
        if (callback) {
          callback();
        }

        // Safety fallback timer: in case pathname doesn't update (e.g. same page or network delay),
        // trigger outro automatically after 450ms
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = setTimeout(() => {
          if (pendingOutroRef.current) {
            playOutroAnimation();
          }
        }, 450);
      });
    };

    window.addEventListener('pageTransition', handlePageTransition as EventListener);
    return () => window.removeEventListener('pageTransition', handlePageTransition as EventListener);
  }, [startTransition, playOutroAnimation]);

  // Route change observer: When Next.js finishes navigating and updates pathname to new route,
  // trigger the transparent pixel smiley outro mask immediately
  useEffect(() => {
    // Skip initial site entry (handled by GlobalLoader)
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      currentPath.current = pathname;
      return;
    }

    if (currentPath.current === pathname) return;
    currentPath.current = pathname;

    // If an explicit navigation transition is in progress and waiting for new page to mount:
    if (isTransitioningRef.current && pendingOutroRef.current) {
      // New route DOM has mounted! Play transparent cutout outro to reveal new page!
      playOutroAnimation();
      return;
    }

    // Fallback for browser Back/Forward native history navigation
    if (!overlayRef.current || isTransitioningRef.current) return;

    const overlay = overlayRef.current;
    const solidBg = solidBgRef.current;
    const outroCutout = outroCutoutRef.current;
    const brandText = brandTextRef.current;

    isTransitioningRef.current = true;
    startTransition();

    gsap.killTweensOf([overlay, solidBg, outroCutout, brandText]);
    gsap.set(overlay, { display: 'flex', pointerEvents: 'auto', opacity: 1 });
    if (solidBg) gsap.set(solidBg, { opacity: 1 });
    if (brandText) gsap.set(brandText, { opacity: 1, scale: 1 });
    if (outroCutout) gsap.set(outroCutout, { scale: 0.85, opacity: 0, display: 'flex' });

    // Scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
        gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        endTransition();
      },
    });

    tl.to({}, { duration: 0.1 });

    if (brandText) {
      tl.to(brandText, { opacity: 0, scale: 0.9, duration: 0.14 });
    }

    if (outroCutout) {
      tl.add(() => {
        if (solidBg) gsap.set(solidBg, { opacity: 0 });
        gsap.set(outroCutout, { opacity: 1, scale: 0.85 });
      });

      tl.to(outroCutout, {
        scale: 45,
        duration: 0.58,
        ease: 'power3.inOut',
      });
    }

    tl.to(overlay, { opacity: 0, duration: 0.08 }, '>-0.06');
  }, [pathname, startTransition, endTransition, playOutroAnimation]);

  return (
    <div
      ref={overlayRef}
      id="page-transition-overlay"
      className="page-transition-overlay fixed inset-0 z-[99999] hidden flex-col items-center justify-center bg-transparent pointer-events-none select-none overflow-hidden will-change-transform"
      style={{ transformOrigin: 'center center' }}
    >
      {/* Background layer for holding state */}
      <div
        ref={solidBgRef}
        className="absolute inset-0 bg-[#fd551d] opacity-0"
      />

      {/* Intro Shape Layer: Filled Pixel Smiley in Orange */}
      <div
        ref={introShapeRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        <FilledPixelSmiley color="#fd551d" />
      </div>

      {/* Outro Cutout Layer: Solid orange outer frame with transparent pixel smiley mask hole */}
      <div
        ref={outroCutoutRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <CutoutPixelSmiley color="#fd551d" />
        </div>
      </div>

      {/* Brand Text: @echo_.ng in white with crisp contrast */}
      <div
        ref={brandTextRef}
        className="relative z-10 flex flex-col items-center justify-center gap-2 px-4 text-center opacity-0"
      >
        <span className="font-display tracking-[0.24em] text-xl sm:text-2xl font-bold uppercase text-white drop-shadow-md">
          @echo_.ng
        </span>
      </div>
    </div>
  );
}
