// app/projects/page.tsx
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { getProjects, getCachedProjects, ProjectItem } from '@/lib/projectsData';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionVignette from "@/components/SectionVignette";
import ProjectImageCard from "@/components/ProjectImageCard";
import ImageSkeleton from "@/components/ImageSkeleton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SKELETON_HEIGHTS = [
  'min-h-[300px]',
  'min-h-[420px]',
  'min-h-[240px]',
  'min-h-[360px]',
  'min-h-[280px]',
  'min-h-[460px]',
  'min-h-[260px]',
  'min-h-[380px]',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => getCachedProjects() || []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(() => !getCachedProjects() || getCachedProjects()?.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const animationsInitializedRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const cached = getCachedProjects();
        if (cached && cached.length > 0) {
          setProjects(cached);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        const data = await getProjects();
        setProjects(data);
      } catch (err: unknown) {
        console.error("Error fetching projects:", err);
        const message = err instanceof Error ? err.message : "Failed to load projects.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Run animations when projects load or filter changes
  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (isLoading || projects.length === 0) return;

    animationTimeoutRef.current = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Header animations - only run once
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
  }, [isLoading, projects.length, filterKey]);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (selectedCategory === "all") return true;
        return p.category === selectedCategory;
      })
      .filter(project => project.image && project.image.trim() !== '');
  }, [projects, selectedCategory]);

  // Handle filter change
  const handleFilterChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilterKey(prev => prev + 1);
  };

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "graphics", label: "Graphics" },
    { id: "photo", label: "Photography" },
    { id: "video", label: "Videos" },
    { id: "website", label: "Website" },
  ];

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="relative z-10 py-16 px-4 sm:px-6 bg-transparent min-h-screen text-white font-display pt-24"
      >
        <div ref={headerRef} className="text-center max-w-[560px] mx-auto mb-8">
          <h1 className="font-normal text-[clamp(1.5rem,4vw,2.2rem)] mb-2 tracking-[0.05em] uppercase text-white font-display">
            PROJECTS
          </h1>
          <p className="text-sm text-[#fd551d] leading-relaxed font-display">
            Explore my web design, media, and visual projects
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer font-bold ${
                selectedCategory === cat.id
                  ? "bg-[#fd551d] text-zinc-950 shadow-md shadow-[#fd551d]/40"
                  : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 border border-zinc-700/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pinterest Masonry Skeleton when loading */}
        {isLoading && (
          <div className="max-w-[1400px] mx-auto w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="break-inside-avoid mb-4">
                <ImageSkeleton
                  heightClass={SKELETON_HEIGHTS[idx % SKELETON_HEIGHTS.length]}
                  isLightContext={false}
                />
              </div>
            ))}
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
                className="max-w-[1400px] mx-auto w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4"
              >
                {filteredProjects.map((project, idx) => (
                  <ProjectImageCard
                    key={project.id}
                    project={project}
                    index={idx}
                    isLightContext={false}
                  />
                ))}
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto text-center py-20 text-zinc-400">
                <p className="text-sm">No projects found in this category</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Vignette fader before footer */}
      <SectionVignette />
    </>
  );
}
