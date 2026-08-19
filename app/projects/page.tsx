'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useLoading } from '@/lib/LoadingContext';
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2, Home, ArrowLeft } from "lucide-react";

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

export default function ProjectsPage() {
  const { incrementLoaded, resetLoading, setTotalItems } = useLoading();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [animationsInitialized, setAnimationsInitialized] = useState(false);
  const [filterKey, setFilterKey] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const hasIncremented = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    resetLoading();
    setTotalItems(1);

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

        // Shuffle projects on initial load
        const shuffled = [...fetchedProjects].sort(() => Math.random() - 0.5);
        setProjects(shuffled || []);

        // Get image dimensions for all projects
        const dimensions: Record<string, { width: number; height: number }> = {};
        await Promise.all(
          shuffled.map((project) => {
            return new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = function () {
                dimensions[project.id] = {
                  width: img.width,
                  height: img.height
                };
                resolve();
              };
              img.onerror = function () {
                dimensions[project.id] = {
                  width: 1,
                  height: 1
                };
                resolve();
              };
              img.src = project.image;
            });
          })
        );
        setImageDimensions(dimensions);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load projects from Google Drive.");
      } finally {
        setIsLoading(false);
        if (!hasIncremented.current) {
          hasIncremented.current = true;
          incrementLoaded();
        }
      }
    }

    fetchDriveProjects();
  }, [setTotalItems, incrementLoaded, resetLoading]);

  // Run animations when projects load or filter changes
  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (isLoading || projects.length === 0) return;

    animationTimeoutRef.current = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Header animations - only run once
        if (headerRef.current && !animationsInitialized) {
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

        // Batch animations - run on filter change
        const batchElements = document.querySelectorAll(".batch-image");
        if (batchElements.length > 0) {
          // First make all batch images visible
          batchElements.forEach(el => {
            gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 });
          });

          // Then apply entrance animation
          ScrollTrigger.batch(".batch-image", {
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { autoAlpha: 0, y: 55, scale: 0.92 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.08,
                  duration: 0.8,
                  ease: "power3.out",
                  overwrite: "auto",
                }
              ),
            onEnterBack: (batch) =>
              gsap.fromTo(
                batch,
                { autoAlpha: 0, y: 55, scale: 0.92 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.08,
                  duration: 0.8,
                  ease: "power3.out",
                  overwrite: "auto",
                }
              ),
          });
        }

        // Parallax animations - run once
        if (!animationsInitialized) {
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

        setAnimationsInitialized(true);
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
  }, [isLoading, projects.length, filterKey]);

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize filtered and shuffled projects
  const filteredProjects = useMemo(() => {
    // First filter by category
    const filtered = projects
      .filter((p) => {
        if (selectedCategory === "all") return true;
        return p.category === selectedCategory;
      })
      .filter(project => project.image && project.image.trim() !== '');

    // Then shuffle
    return shuffleArray(filtered);
  }, [projects, selectedCategory]);

  // Handle filter change
  const handleFilterChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilterKey(prev => prev + 1); // Trigger animation re-run
  };

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "graphics", label: "Graphics" },
    { id: "photo", label: "Photography" },
    { id: "video", label: "Videos" },
    { id: "website", label: "Website" },
  ];

  const getAspectRatio = (projectId: string | number) => {
    const dims = imageDimensions[projectId];
    if (dims && dims.width && dims.height) {
      return dims.width / dims.height;
    }
    return 1;
  };

  const getPaddingBottom = (projectId: string | number) => {
    const ratio = getAspectRatio(projectId);
    return `${(1 / ratio) * 100}%`;
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 py-12 px-3 sm:px-6 bg-[#222222] min-h-screen text-white font-display pt-24"
    >
      {/* Back to Home Button */}
      <div className="max-w-[1280px] mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div ref={headerRef} className="text-center max-w-[560px] mx-auto mb-8">
        <h1 className="font-normal text-[clamp(1.5rem,4vw,2.2rem)] mb-2 tracking-[0.05em] uppercase text-white font-display">
          PROJECTS
        </h1>
        <p className="text-sm text-[#fd551d] leading-relaxed font-display">
          Explore my web design, media, and visual projects
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilterChange(cat.id)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 ${selectedCategory === cat.id
                ? "bg-[#fd551d] text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#fd551d] mb-3" />
          <p className="text-xs uppercase tracking-widest">Loading Projects...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="max-w-md mx-auto my-10 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center rounded-xl">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filteredProjects.length > 0 ? (
            <div
              key={filterKey}
              className="max-w-[1280px] mx-auto w-full columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-4 [&>div]:mb-2.5 sm:[&>div]:mb-4"
            >
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="batch-image opacity-0 invisible w-full relative overflow-hidden will-change-transform shadow-sm group rounded-sm bg-zinc-900 break-inside-avoid"
                >
                  <div
                    className="project-img-inner w-full relative overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105"
                    style={{
                      paddingBottom: getPaddingBottom(project.id),
                      height: 0
                    }}
                  >
                    <Image
                      src={project.image}
                      alt="Project media"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover absolute inset-0 w-full h-full"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const parent = e.currentTarget.closest('.batch-image');
                        if (parent) {
                          (parent as HTMLElement).style.display = 'none';
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-[1280px] mx-auto text-center py-20 text-zinc-400">
              <p className="text-sm">No projects found in this category</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}