'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLoading } from '@/lib/LoadingContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScatteredImage {
    src: string;
    alt: string;
    title?: string;
    year?: string;
    category?: string;
    width: string;     // e.g. "w-[28vw]"
    height: string;    // e.g. "h-[45vh]"
    left: string;      // Absolute position X in canvas (e.g. "left-[5vw]")
    top: string;       // Absolute position Y in canvas (e.g. "top-[20vh]")
    speed?: number;    // Parallax speed multiplier relative to track scroll
    mobileOffset?: string; // Tailwind class for mobile scattered alignment
    mobileHeight?: string; // Custom height for mobile scattered feel
}

const landoStyleImages: ScatteredImage[] = [
    {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[28vw]',
        height: 'h-[45vh]',
        left: 'left-[5vw]',
        top: 'top-[20vh]',
        speed: 1.1,
        mobileOffset: 'w-[80%] self-start',
        mobileHeight: 'h-[40vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[20vw]',
        height: 'h-[30vh]',
        left: 'left-[38vw]',
        top: 'top-[5vh]',
        speed: 0.85,
        mobileOffset: 'w-[65%] self-end mr-2',
        mobileHeight: 'h-[30vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[22vw]',
        height: 'h-[38vh]',
        left: 'left-[42vw]',
        top: 'top-[52vh]',
        speed: 1.25,
        mobileOffset: 'w-[75%] self-center ml-6',
        mobileHeight: 'h-[35vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[32vw]',
        height: 'h-[55vh]',
        left: 'left-[70vw]',
        top: 'top-[18vh]',
        speed: 0.95,
        mobileOffset: 'w-[85%] self-start ml-2',
        mobileHeight: 'h-[48vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[18vw]',
        height: 'h-[28vh]',
        left: 'left-[108vw]',
        top: 'top-[8vh]',
        speed: 1.15,
        mobileOffset: 'w-[60%] self-end mr-4',
        mobileHeight: 'h-[28vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[24vw]',
        height: 'h-[40vh]',
        left: 'left-[112vw]',
        top: 'top-[48vh]',
        speed: 0.9,
        mobileOffset: 'w-[75%] self-start ml-4',
        mobileHeight: 'h-[38vh]',
    },
    {
        src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
        alt: 'TITLE',
        title: 'TITLE',
        year: 'YEAR',
        width: 'w-[26vw]',
        height: 'h-[42vh]',
        left: 'left-[142vw]',
        top: 'top-[22vh]',
        speed: 1.05,
        mobileOffset: 'w-[80%] self-end',
        mobileHeight: 'h-[42vh]',
    },
];

interface HorizontalScrollProps {
    images?: ScatteredImage[];
}

export default function GallerySection({
    images = landoStyleImages,
}: HorizontalScrollProps) {
    const { incrementLoaded } = useLoading();
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const triggerRef = useRef<HTMLDivElement>(null);
    const outerTrackRef = useRef<HTMLDivElement>(null);
    const innerTrackRef = useRef<HTMLDivElement>(null);

    // Track image loading
    useEffect(() => {
        if (imagesLoaded >= images.length) {
            incrementLoaded();
        }
    }, [imagesLoaded, images.length, incrementLoaded]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!triggerRef.current || !outerTrackRef.current || !innerTrackRef.current) return;

            const trigger = triggerRef.current;
            const outer = outerTrackRef.current;
            const inner = innerTrackRef.current;

            const mm = gsap.matchMedia();

            // Desktop View (Pinned Horizontal Scroll + Global Shader Color Scrubbing)
            mm.add('(min-width: 768px)', () => {
                // Entrance Motion
                gsap.fromTo(
                    outer,
                    { x: () => window.innerWidth * 0.45, opacity: 0.85, scale: 0.98 },
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

                // Pinned Scrub
                const getScrollAmount = () => -(inner.scrollWidth - window.innerWidth);
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: trigger,
                        start: 'top top',
                        end: () => `+=${inner.scrollWidth}`,
                        pin: true,
                        scrub: true,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            window.dispatchEvent(
                                new CustomEvent('shader-scroll-progress', {
                                    detail: { progress: self.progress },
                                })
                            );
                        },
                    },
                });

                tl.fromTo(inner, { x: 0 }, { x: getScrollAmount, ease: 'none' }, 0);
            });

            // Mobile View (Vertical Scroll + Global Shader Color Scrubbing)
            mm.add('(max-width: 767px)', () => {
                ScrollTrigger.create({
                    trigger: trigger,
                    start: 'top 50%',
                    end: 'bottom bottom',
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        window.dispatchEvent(
                            new CustomEvent('shader-scroll-progress', {
                                detail: { progress: self.progress },
                            })
                        );
                    },
                });
            });
        }, triggerRef);

        return () => ctx.revert();
    }, [images]);

    // Handle image load tracking
    const handleImageLoad = () => {
        setImagesLoaded((prev) => prev + 1);
    };

    return (
        <section
            id="gallery"
            ref={triggerRef}
            className="relative overflow-hidden bg-transparent text-neutral-100 border-none outline-none shadow-none"
        >
            {/* Container */}
            <div className="relative z-10 min-h-screen md:h-screen w-full flex items-center overflow-hidden py-10 md:py-0 border-none outline-none">
                <div ref={outerTrackRef} className="w-full will-change-transform">
                    {/* Desktop Scattered Canvas Track */}
                    <div
                        ref={innerTrackRef}
                        className="hidden md:block relative h-screen w-[185vw] md:w-[175vw] shrink-0 will-change-transform flex-nowrap"
                    >
                        {images.map((img, index) => (
                            <div
                                key={`desktop-${index}`}
                                className={`scattered-card absolute flex flex-col group ${img.left} ${img.top} ${img.width} ${img.height} will-change-transform`}
                            >
                                {/* Title above image */}
                                {(img.title || img.year) && (
                                    <div className="mb-2 flex items-center justify-between text-[10px] tracking-widest text-neutral-400 uppercase font-mono">
                                        <span>{img.title}</span>
                                        <span>{img.year}</span>
                                    </div>
                                )}

                                {/* Image container */}
                                <div className="relative w-full h-full overflow-hidden bg-neutral-950 group flex items-center justify-center border-none outline-none">
                                    <Image
                                        src={img.src}
                                        alt={img.alt || img.title || `Gallery visual ${index + 1}`}
                                        fill
                                        sizes="35vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 border-none outline-none"
                                        loading="lazy"
                                        onLoad={handleImageLoad}
                                        onError={handleImageLoad}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Vertical Scattered Scroll Layout */}
                    <div className="flex md:hidden flex-col gap-14 px-4 py-12 w-full">
                        {images.map((img, index) => (
                            <div
                                key={`mobile-${index}`}
                                className={`flex flex-col ${img.mobileOffset || 'w-full'}`}
                            >
                                {(img.title || img.year) && (
                                    <div className="mb-2 flex items-center justify-between text-xs tracking-widest text-neutral-400 uppercase font-mono">
                                        <span>{img.title}</span>
                                        <span>{img.year}</span>
                                    </div>
                                )}
                                <div className={`relative w-full ${img.mobileHeight || 'h-[40vh]'} overflow-hidden bg-neutral-950`}>
                                    <Image
                                        src={img.src}
                                        alt={img.alt || img.title || `Gallery visual ${index + 1}`}
                                        fill
                                        sizes="100vw"
                                        className="object-cover"
                                        loading="lazy"
                                        onLoad={handleImageLoad}
                                        onError={handleImageLoad}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}