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
        src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
        alt: 'Work sample 4',
        title: 'Aura Form & Void',
        category: 'Sculpture',
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
        const ctx = gsap.context(() => {
            if (!triggerRef.current || !outerTrackRef.current || !innerTrackRef.current || !bgOverlayRef.current) return;

            const trigger = triggerRef.current;
            const outer = outerTrackRef.current;
            const inner = innerTrackRef.current;
            const bgOverlay = bgOverlayRef.current;

            // 1. Entrance Active Motion:
            // Glides smoothly from the right into center alignment
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

            // 2. Pinned Horizontal Scrubbing & Background Opacity Transition:
            // Locks and pins when top hits screen top ("top top")
            // Simultaneously translates track and scrubs overlay opacity from 0 (0%) to 1 (100%)
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

            // Scrub inner track horizontal scroll
            tl.fromTo(
                inner,
                { x: 0 },
                { x: getScrollAmount, ease: 'none' },
                0
            );

            // Scrub background overlay opacity linearly from 0 to 1
            tl.fromTo(
                bgOverlay,
                { opacity: 0 },
                { opacity: 1, ease: 'none' },
                0
            );
        }, triggerRef);

        return () => ctx.revert();
    }, [images]);

    return (
        <section
            id="gallery"
            ref={triggerRef}
            className="relative overflow-hidden bg-transparent text-neutral-100"
        >
            {/* Fixed Overlay Layer driven by opacity */}
            <div
                id="white-bg-layer"
                ref={bgOverlayRef}
                className="fixed inset-0 bg-white pointer-events-none z-0"
                style={{ opacity: 0 }}
            />

            {/* Container for the horizontal images */}
            <div className="relative z-10 h-screen w-full flex items-center overflow-hidden">
                {/* Outer track: handles smooth right-to-left entrance transition */}
                <div ref={outerTrackRef} className="w-full will-change-transform">
                    {/* Inner track: handles linear pinned horizontal scrub */}
                    <div
                        ref={innerTrackRef}
                        className="flex items-center gap-10 pl-0 pr-[10vw] will-change-transform"
                    >
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="relative w-[75vw] sm:w-[60vw] md:w-[50vw] aspect-[16/10] shrink-0 overflow-hidden shadow-2xl bg-neutral-950 group"
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
