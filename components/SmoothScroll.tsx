// components/SmoothScroll.tsx
'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/lib/LoadingContext';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
    ScrollTrigger.clearScrollMemory('manual');
}

export type LenisContextType = {
    getLenis: () => Lenis | null;
    scrollTo: (target: string | number | HTMLElement, options?: Parameters<Lenis['scrollTo']>[1]) => void;
};

const LenisContext = createContext<LenisContextType>({
    getLenis: () => null,
    scrollTo: () => { },
});

export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const existingContext = useContext(LenisContext);
    const pathname = usePathname();
    const { isLoading, isTransitioning } = useLoading();
    const lenisRef = useRef<Lenis | null>(null);

    // Helper function to scroll to a target
    const scrollTo = useCallback((target: string | number | HTMLElement, options?: Parameters<Lenis['scrollTo']>[1]) => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, options);
        } else if (typeof window !== 'undefined') {
            if (typeof target === 'number') {
                window.scrollTo({ top: target, behavior: 'smooth' });
            }
        }
    }, []);

    const getLenis = useCallback(() => lenisRef.current, []);

    // Initialize Lenis and synchronize with GSAP ScrollTrigger
    useEffect(() => {
        // If a parent instance is already active, don't instantiate another
        if (existingContext.getLenis()) return;

        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        // Synchronize Lenis scroll with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis via GSAP ticker for frame-perfect animation alignment without jitter
        const updateTicker = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);

        // Initial refresh
        ScrollTrigger.refresh();

        const handleResize = () => {
            lenis.resize();
            ScrollTrigger.refresh();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            gsap.ticker.remove(updateTicker);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [existingContext]);

    // Handle route changes: reset scroll position immediately and refresh ScrollTrigger
    useEffect(() => {
        if (!lenisRef.current) return;

        // Reset scroll to top on page navigation
        lenisRef.current.scrollTo(0, { immediate: true });
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

        // Allow the new route's DOM to mount and settle before recalculating ScrollTrigger bounds
        const timeout = setTimeout(() => {
            if (lenisRef.current) {
                lenisRef.current.resize();
            }
            ScrollTrigger.refresh();
        }, 120);

        return () => clearTimeout(timeout);
    }, [pathname]);

    // Control scrolling during loading or page transition overlays
    useEffect(() => {
        if (!lenisRef.current) return;

        if (isLoading || isTransitioning) {
            lenisRef.current.stop();
        } else {
            lenisRef.current.start();
            ScrollTrigger.refresh();
        }
    }, [isLoading, isTransitioning]);

    const contextValue = useMemo(() => ({
        getLenis,
        scrollTo,
    }), [getLenis, scrollTo]);

    // If already wrapped by an ancestor, pass through
    if (existingContext.getLenis()) {
        return <>{children}</>;
    }

    return (
        <LenisContext.Provider value={contextValue}>
            {children}
        </LenisContext.Provider>
    );
}

