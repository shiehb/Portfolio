// components/SmoothScroll.tsx
'use client';

import { useEffect } from 'react';
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

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const { isLoading, isTransitioning } = useLoading();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            window.scrollTo(0, 0);
        }

        const handleBeforeUnload = () => {
            window.scrollTo(0, 0);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (isLoading || isTransitioning) return;

        // Ensure window scroll is at top before Lenis and ScrollTrigger engage
        window.scrollTo(0, 0);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenis.scrollTo(0, { immediate: true });
        lenis.on('scroll', ScrollTrigger.update);

        const updateTicker = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);

        // Refresh triggers with top baseline
        ScrollTrigger.refresh();

        return () => {
            gsap.ticker.remove(updateTicker);
            lenis.destroy();
        };
    }, [isLoading, isTransitioning]);

    return <>{children}</>;
}