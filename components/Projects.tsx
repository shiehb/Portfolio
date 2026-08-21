// components/Projects.tsx
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import { triggerPageTransition } from '@/lib/transitionEvents';
import { getProjects, getCachedProjects, ProjectItem } from '@/lib/projectsData';
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Grid3x3, ArrowRight } from "lucide-react";
import ProjectImageCard from "./ProjectImageCard";
import ImageSkeleton from "./ImageSkeleton";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const SKELETON_HEIGHTS = [
    'min-h-[280px]',
    'min-h-[380px]',
    'min-h-[220px]',
    'min-h-[340px]',
    'min-h-[300px]',
    'min-h-[420px]',
    'min-h-[260px]',
    'min-h-[360px]',
];

export default function Projects() {
    const router = useRouter();
    const { incrementLoaded, hasInitialLoaded } = useLoading();
    const [projects, setProjects] = useState<ProjectItem[]>(() => {
        const cached = getCachedProjects();
        return cached ? cached.slice(0, 12) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !getCachedProjects() || getCachedProjects()?.length === 0);
    const [error, setError] = useState<string | null>(null);

    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const hasIncremented = useRef(false);
    const animationsInitializedRef = useRef(false);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleViewAllClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        triggerPageTransition(() => {
            router.push('/projects');
        }, '/projects', 'PROJECTS');
    };

    useEffect(() => {
        async function loadDriveProjects() {
            try {
                const cached = getCachedProjects();
                if (cached && cached.length > 0) {
                    setProjects(cached.slice(0, 12));
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                setError(null);
                const allProjects = await getProjects();
                setProjects(allProjects.slice(0, 12));
            } catch (err: unknown) {
                console.error("Error fetching projects:", err);
                const message = err instanceof Error ? err.message : "Failed to load projects.";
                setError(message);
            } finally {
                setIsLoading(false);
                if (!hasIncremented.current && !hasInitialLoaded) {
                    hasIncremented.current = true;
                    incrementLoaded();
                }
            }
        }

        loadDriveProjects();
    }, [incrementLoaded, hasInitialLoaded]);

    // Run entrance animations when projects load
    useEffect(() => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        if (isLoading || projects.length === 0) return;

        animationTimeoutRef.current = setTimeout(() => {
            const ctx = gsap.context(() => {
                if (headerRef.current && !animationsInitializedRef.current) {
                    gsap.fromTo(
                        headerRef.current.children,
                        { y: 35, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            stagger: 0.12,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: headerRef.current,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }

                const batchElements = document.querySelectorAll(".batch-image");
                if (batchElements.length > 0) {
                    batchElements.forEach(el => {
                        gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 });
                    });
                }

                animationsInitializedRef.current = true;
            }, sectionRef);

            return () => {
                ctx.revert();
            };
        }, 150);

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [isLoading, projects.length]);

    const validProjects = useMemo(() => {
        return projects.filter(project => project.image && project.image.trim() !== '');
    }, [projects]);

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative z-10 py-16 px-4 sm:px-6 bg-transparent min-h-screen text-zinc-900 font-display"
        >
            <div ref={headerRef} className="text-center max-w-[560px] mx-auto mb-10">
                <h2 className="font-normal text-[clamp(1.5rem,4vw,2.2rem)] mb-2 tracking-[0.05em] uppercase text-zinc-900 font-display">
                    PROJECTS
                </h2>
                <p className="text-sm text-[#fd551d] leading-relaxed font-display">
                    Explore my web design, media, and visual projects
                </p>
            </div>

            {/* Pinterest Masonry Skeleton when loading */}
            {isLoading && (
                <div className="max-w-[1400px] mx-auto w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="break-inside-avoid mb-4">
                            <ImageSkeleton
                                heightClass={SKELETON_HEIGHTS[idx % SKELETON_HEIGHTS.length]}
                                isLightContext={true}
                            />
                        </div>
                    ))}
                </div>
            )}

            {error && !isLoading && (
                <div className="max-w-md mx-auto my-10 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs text-center rounded-xl">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <div className="max-w-[1400px] mx-auto w-full">
                    {/* Pinterest Waterfall Masonry Columns */}
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                        {validProjects.map((project, idx) => (
                            <ProjectImageCard
                                key={project.id}
                                project={project}
                                index={idx}
                                isLightContext={true}
                            />
                        ))}

                        {/* Dedicated View All Action Tile */}
                        {validProjects.length > 0 && (
                            <div className="break-inside-avoid mb-4">
                                <Link
                                    href="/projects"
                                    onClick={handleViewAllClick}
                                    className="w-full min-h-[220px] relative overflow-hidden group rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200/90 border-2 border-dashed border-zinc-300 hover:border-[#fd551d] hover:bg-zinc-200 transition-all duration-500 flex flex-col items-center justify-center text-center p-6 cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-full bg-white shadow-sm group-hover:bg-[#fd551d]/10 transition-colors duration-300 flex items-center justify-center">
                                            <Grid3x3 className="w-5 h-5 text-zinc-700 group-hover:text-[#fd551d] transition-colors duration-300" />
                                        </div>

                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-bold uppercase tracking-wider text-zinc-800 group-hover:text-[#fd551d] transition-colors duration-300">
                                                View All Projects
                                            </span>
                                            <span className="text-[11px] uppercase tracking-widest text-zinc-500">
                                                Pinterest Gallery
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-600 group-hover:text-[#fd551d] transition-colors duration-300 font-semibold">
                                            <span>Open Collection</span>
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
