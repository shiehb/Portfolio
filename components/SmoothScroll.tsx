// components/SmoothScroll.tsx
'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenis.on('scroll', ScrollTrigger.update);

        const updateTicker = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);

        // Mark as ready after a small delay to ensure smooth scroll is initialized
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);

        return () => {
            gsap.ticker.remove(updateTicker);
            lenis.destroy();
            clearTimeout(timer);
        };
    }, []);

    // Show loading until smooth scroll is ready
    if (!isReady) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#222222]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                    <div className="absolute inset-0 border-2 border-[#fd551d] rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}