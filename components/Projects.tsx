// components/Projects.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import { triggerPageTransition } from '@/lib/transitionEvents';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export interface StaticProject {
    id: string;
    image: string;
    alt: string;
}

// 12 showcase projects distributed into 4 staggered columns (3 containers per column)
const COLUMNS_DATA: StaticProject[][] = [
    // Column 1 (Starts at top)
    [
        { id: 'proj-1', image: '/images/project-1.jpg', alt: 'Aero Carbon project showcase' },
        { id: 'proj-5', image: '/images/project-1.jpg', alt: 'Monster Camo project showcase' },
        { id: 'proj-9', image: '/images/project-1.jpg', alt: 'Spectrum Shift project showcase' },
    ],
    // Column 2 (Offset lower - Norris staggered padding)
    [
        { id: 'proj-2', image: '/images/project-1.jpg', alt: 'Neon Matrix project showcase' },
        { id: 'proj-6', image: '/images/project-1.jpg', alt: 'Porcelain Flora project showcase' },
        { id: 'proj-10', image: '/images/project-1.jpg', alt: 'Obsidian Stealth project showcase' },
    ],
    // Column 3 (Starts higher with subtle offset)
    [
        { id: 'proj-3', image: '/images/project-1.jpg', alt: 'Chrome Disco project showcase' },
        { id: 'proj-7', image: '/images/project-1.jpg', alt: 'Pixel Telemetry project showcase' },
        { id: 'proj-11', image: '/images/project-1.jpg', alt: 'Aurora Vector project showcase' },
    ],
    // Column 4 (Offset lower)
    [
        { id: 'proj-4', image: '/images/project-1.jpg', alt: 'Dark Glitter project showcase' },
        { id: 'proj-8', image: '/images/project-1.jpg', alt: 'Speed Hyper project showcase' },
        { id: 'proj-12', image: '/images/project-1.jpg', alt: 'Apex Horizon project showcase' },
    ],
];

// Column vertical offset padding classes (matching Lando Norris staggered layout)
const COLUMN_OFFSETS = [
    'pt-0',                         // Column 1
    'pt-6 sm:pt-10 lg:pt-24',       // Column 2 (staggered down)
    'pt-0 lg:pt-8',                 // Column 3 (slight offset on 4-col)
    'pt-6 sm:pt-10 lg:pt-28',       // Column 4 (staggered down)
];

export default function Projects() {
    const router = useRouter();
    const { incrementLoaded, hasInitialLoaded } = useLoading();
    const hasIncremented = useRef(false);

    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    const handleNavigateToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        triggerPageTransition(() => {
            router.push('/projects');
        }, '/projects', 'PROJECTS');
    };

    useEffect(() => {
        if (!hasIncremented.current && !hasInitialLoaded) {
            hasIncremented.current = true;
            incrementLoaded();
        }
    }, [incrementLoaded, hasInitialLoaded]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header scroll animation
            if (headerRef.current) {
                gsap.fromTo(
                    headerRef.current.children,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // Column items entrance fade
            if (gridRef.current) {
                const items = gridRef.current.querySelectorAll('.grid-image-item');
                gsap.fromTo(
                    items,
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        stagger: 0.06,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: 'top 88%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // CTA animation
            if (ctaRef.current) {
                gsap.fromTo(
                    ctaRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: ctaRef.current,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative z-10 py-16 md:py-24 px-4 sm:px-8 lg:px-16 w-full mx-auto bg-transparent font-display"
        >
            {/* Section Header */}
            <div ref={headerRef} className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
                <h2 className="font-normal text-[clamp(1.5rem,4vw,2.2rem)] mb-2 tracking-[0.05em] uppercase text-zinc-900 font-display">
                    PROJECTS
                </h2>
                <p className="text-sm text-[#fd551d] leading-relaxed font-display">
                    Explore my web design, media, and visual projects
                </p>
            </div>

            {/* Norris-style Staggered Column Grid (12 image containers) */}
            <div ref={gridRef} className="w-full">
                {/* Mobile & Tablet: 2 Columns | Laptop & Desktop: 4 Columns */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 items-start">
                    {COLUMNS_DATA.map((columnProjects, colIdx) => (
                        <div
                            key={`col-${colIdx}`}
                            className={`flex flex-col gap-4 md:gap-6 lg:gap-8 ${COLUMN_OFFSETS[colIdx]}`}
                        >
                            {columnProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="grid-image-item relative w-full aspect-[3/2] overflow-hidden rounded-lg bg-[#0e0e11] border border-zinc-800/80 shadow-md transition-all duration-300 hover:border-zinc-600/80"
                                >
                                    <Image
                                        src={project.image}
                                        alt={project.alt}
                                        fill
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                        className="object-cover block select-none"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Block with Black/Dark Typography */}
            <div
                ref={ctaRef}
                className="flex flex-col items-center justify-center text-center mt-16 sm:mt-24 space-y-6 px-4"
            >
                {/* Top Center Brand Logo */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    <Image
                        src="/img/logo.webp"
                        alt="Brand Logo"
                        width={56}
                        height={56}
                        className="w-full h-full object-contain drop-shadow-sm"
                    />
                </div>

                {/* Headline Text (Dark/Black) */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 max-w-xl text-center leading-snug">
                    See more inspired projects and highlights from the portfolio
                </h3>

                {/* Designated Navigation Button */}
                <div>
                    <Link
                        href="/projects"
                        onClick={handleNavigateToProjects}
                        className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition-all duration-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <span>View All Projects</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
