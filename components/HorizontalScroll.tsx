'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const defaultGalleryImages = [
    {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
        alt: 'Work sample 1',
        title: 'Monolith Pavilion',
        category: 'Architecture',
    },
    {
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        alt: 'Work sample 2',
        title: 'Vesper Lightfield',
        category: 'Installation',
    },
    {
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
        alt: 'Work sample 3',
        title: 'Chronos Horizon',
        category: 'Industrial Design',
    },
    {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop',
        alt: 'Work sample 5',
        title: 'Solstice Sanctuary',
        category: 'Interior Architecture',
    },
];

interface HorizontalScrollProps {
    images?: { src: string; alt: string; title?: string; category?: string }[];
}

export default function HorizontalScroll({
    images = defaultGalleryImages,
}: HorizontalScrollProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const outerTrackRef = useRef<HTMLDivElement>(null);
    const innerTrackRef = useRef<HTMLDivElement>(null);
    const bgOverlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Use GSAP matchMedia to only run horizontal pinned scroll on desktop screens (768px+)
        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
            if (!triggerRef.current || !outerTrackRef.current || !innerTrackRef.current || !bgOverlayRef.current) return;

            const trigger = triggerRef.current;
            const outer = outerTrackRef.current;
            const inner = innerTrackRef.current;
            const bgOverlay = bgOverlayRef.current;

            // Entrance Active Motion
            gsap.fromTo(
                outer,
                {
                    x: () => window.innerWidth * 0.45,
                    opacity: 0.85,
                    scale: 0.98,
                },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: trigger,
                        start: 'top bottom',
                        end: 'top top',
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                }
            );

            // Pinned Horizontal Scrubbing
            const getScrollAmount = () => -(inner.scrollWidth - window.innerWidth);

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: trigger,
                    start: 'top top',
                    end: () => `+=${inner.scrollWidth}`,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            });

            tl.fromTo(
                inner,
                { x: 0 },
                { x: getScrollAmount, ease: 'none' },
                0
            );

            tl.fromTo(
                bgOverlay,
                { opacity: 0 },
                { opacity: 1, ease: 'none' },
                0
            );
        });

        return () => mm.revert();
    }, [images]);

    return (
        <section
            id="gallery"
            ref={triggerRef}
            className="relative overflow-hidden bg-transparent text-neutral-100 py-10 md:py-0"
        >
            {/* Background Layer */}
            <div
                id="white-bg-layer"
                ref={bgOverlayRef}
                className="fixed inset-0 bg-white pointer-events-none z-0 hidden md:block"
                style={{ opacity: 0 }}
            />

            {/* Container */}
            <div className="relative z-10 min-h-screen md:h-screen w-full flex items-center overflow-hidden">
                <div ref={outerTrackRef} className="w-full will-change-transform">
                    {/* Inner Track: Stacks vertically on mobile, switches to horizontal row on desktop */}
                    <div
                        ref={innerTrackRef}
                        className="flex flex-col md:flex-row items-center gap-8 md:gap-10 px-4 md:pl-10 md:pr-[10vw] will-change-transform"
                    >
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="relative h-[70vh] md:h-[90vh] w-full md:w-auto shrink-0 overflow-hidden shadow-2xl bg-neutral-950 group flex items-center justify-center"
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full md:w-auto max-w-none object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                            defaultGalleryImages[index % defaultGalleryImages.length].src;
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}