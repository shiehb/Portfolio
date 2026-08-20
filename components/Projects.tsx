'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2, Grid3x3, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ProjectItem {
    id: string | number;
    image: string;
    category: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

export default function Projects() {
    const { incrementLoaded } = useLoading();
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const hasIncremented = useRef(false);
    const animationsInitializedRef = useRef(false);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function fetchDriveProjects() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/drive");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load projects");
                }

                const fetchedProjects: ProjectItem[] = (data.projects || [])
                    .filter((project: ProjectItem) => {
                        const hasValidId = project.id !== undefined && project.id !== null && project.id !== '';
                        const hasValidImage = project.image && project.image.trim() !== '';
                        const hasValidCategory = project.category && project.category.trim() !== '';
                        return hasValidId && hasValidImage && hasValidCategory;
                    });

                // Select 12 projects on initial load
                const selectedProjects = fetchedProjects.slice(0, 12);
                setProjects(selectedProjects);
            } catch (err: unknown) {
                console.error("Error fetching projects:", err);
                const message = err instanceof Error ? err.message : "Failed to load projects from Google Drive.";
                setError(message);
            } finally {
                setIsLoading(false);
                if (!hasIncremented.current) {
                    hasIncremented.current = true;
                    incrementLoaded();
                }
            }
        }

        fetchDriveProjects();
    }, [incrementLoaded]);

    // Run animations when projects load
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
                        { y: 45, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            stagger: 0.15,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: headerRef.current,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }

                // Make all images visible immediately
                const batchElements = document.querySelectorAll(".batch-image");
                if (batchElements.length > 0) {
                    batchElements.forEach(el => {
                        gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 });
                    });
                }

                // Parallax animations
                if (!animationsInitializedRef.current) {
                    const images = gsap.utils.toArray<HTMLElement>(".project-img-inner");
                    images.forEach((img) => {
                        const parent = img.parentElement;
                        if (parent) {
                            gsap.fromTo(
                                img,
                                { scale: 1.25 },
                                {
                                    scale: 1.0,
                                    ease: "none",
                                    scrollTrigger: {
                                        trigger: parent,
                                        start: "top bottom",
                                        end: "bottom top",
                                        scrub: true,
                                    },
                                }
                            );
                        }
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

    const getPaddingBottom = (index: number) => {
        const ratios = ['125%', '100%', '75%', '133%'];
        return ratios[index % ratios.length];
    };

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative z-10 py-12 px-3 sm:px-6 bg-transparent min-h-screen text-zinc-900 font-display"
        >
            <div ref={headerRef} className="text-center max-w-[560px] mx-auto mb-8">
                <h2 className="font-normal text-[clamp(1.5rem,4vw,2.2rem)] mb-2 tracking-[0.05em] uppercase text-zinc-900 font-display">
                    PROJECTS
                </h2>
                <p className="text-sm text-[#fd551d] leading-relaxed font-display">
                    Explore my web design, media, and visual projects
                </p>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#fd551d] mb-3" />
                    <p className="text-xs uppercase tracking-widest">Loading Projects...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="max-w-md mx-auto my-10 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs text-center rounded-xl">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <div className="max-w-[1280px] mx-auto w-full columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-4 [&>div]:mb-2.5 sm:[&>div]:mb-4">
                    {validProjects.map((project, index) => {
                        return (
                            <div
                                key={project.id}
                                className="batch-image w-full relative overflow-hidden will-change-transform shadow-sm group rounded-sm bg-zinc-100 break-inside-avoid"
                            >
                                <div
                                    className="project-img-inner w-full relative overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105"
                                    style={{
                                        paddingBottom: getPaddingBottom(index),
                                        height: 0
                                    }}
                                >
                                    <Image
                                        src={project.image}
                                        alt={project.category ? `${project.category} visual project by Jericho Urbano` : "Jericho Urbano design and web project"}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover absolute inset-0 w-full h-full"
                                        style={{ objectFit: 'cover' }}
                                        loading="lazy"
                                        onError={(e) => {
                                            const parent = e.currentTarget.closest('.batch-image');
                                            if (parent) {
                                                (parent as HTMLElement).style.display = 'none';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {validProjects.length > 0 && (
                        <Link
                            href="/projects"
                            className="batch-image w-full relative overflow-hidden shadow-sm group rounded-sm bg-gradient-to-br from-zinc-50 to-zinc-100 border-2 border-dashed border-zinc-300 hover:border-[#fd551d] hover:from-zinc-100 hover:to-zinc-200 transition-all duration-500 flex flex-col items-center justify-center text-center p-4 group break-inside-avoid"
                            style={{ minHeight: '200px' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#fd551d]/0 via-[#fd551d]/5 to-[#fd551d]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#fd551d]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative w-12 h-12 rounded-full bg-zinc-200 group-hover:bg-[#fd551d]/10 transition-colors duration-500 flex items-center justify-center">
                                        <Grid3x3 className="w-5 h-5 text-zinc-600 group-hover:text-[#fd551d] transition-colors duration-500" />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-sm font-semibold uppercase tracking-wider text-zinc-700 group-hover:text-[#fd551d] transition-colors duration-500">
                                        View All Projects
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors duration-500">
                                        {validProjects.length}+ Projects
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-zinc-400 group-hover:text-[#fd551d] transition-colors duration-500">
                                        Explore
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#fd551d] transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}