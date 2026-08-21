// app/projects/page.tsx
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { getProjects, getCachedProjects, ProjectItem } from '@/lib/projectsData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionVignette from '@/components/SectionVignette';
import ProjectImageCard from '@/components/ProjectImageCard';
import ImageSkeleton from '@/components/ImageSkeleton';
import { ChevronDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INITIAL_VISIBLE_COUNT = 12;
const PAGE_SIZE = 8;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => getCachedProjects() || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(() => !getCachedProjects() || getCachedProjects()?.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const animationsInitializedRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevVisibleCountRef = useRef(INITIAL_VISIBLE_COUNT);

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
        console.error('Error fetching projects:', err);
        const message = err instanceof Error ? err.message : 'Failed to load projects.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Run animations when projects load, filter changes, or visible count expands
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
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headerRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        // Stagger entrance animation for project masonry cards
        const allItems = document.querySelectorAll('.project-masonry-item');
        if (allItems.length > 0) {
          // If incrementally loading more, animate the newly added chunk; otherwise animate current list
          const isIncremental = prevVisibleCountRef.current < visibleCount && prevVisibleCountRef.current > 0;
          const elementsToAnimate = isIncremental
            ? Array.from(allItems).slice(prevVisibleCountRef.current)
            : Array.from(allItems);

          if (elementsToAnimate.length > 0) {
            gsap.fromTo(
              elementsToAnimate,
              { autoAlpha: 0, y: 30 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                clearProps: 'transform',
              }
            );
          }
        }

        prevVisibleCountRef.current = visibleCount;
        animationsInitializedRef.current = true;
      }, sectionRef);

      return () => {
        ctx.revert();
      };
    }, 60);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isLoading, projects.length, filterKey, visibleCount]);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (selectedCategory === 'all') return true;
        return p.category === selectedCategory;
      })
      .filter((project) => project.image && project.image.trim() !== '');
  }, [projects, selectedCategory]);

  // Paginated slice of filtered projects
  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  // Handle filter change with memoized callback
  const handleFilterChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilterKey((prev) => prev + 1);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    prevVisibleCountRef.current = 0;
  }, []);

  // Handle load more with memoized callback
  const handleLoadMore = useCallback(() => {
    prevVisibleCountRef.current = visibleCount;
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, [visibleCount]);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'graphics', label: 'Graphics' },
    { id: 'photo', label: 'Photography' },
    { id: 'video', label: 'Videos' },
    { id: 'website', label: 'Website' },
  ];

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 mx-auto bg-transparent min-h-screen text-white font-display pt-24"
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
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer font-bold ${selectedCategory === cat.id
                ? 'bg-[#fd551d] text-zinc-950 shadow-md shadow-[#fd551d]/40'
                : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 border border-zinc-700/50'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Responsive Multi-column Masonry Skeleton when loading */}
        {isLoading && (
          <div className="w-full columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 12 }).map((_, idx) => {
              const skeletonAspects = [
                'aspect-[3/4]',
                'aspect-[4/5]',
                'aspect-[2/3]',
                'aspect-[1/1]',
                'aspect-[4/5]',
                'aspect-[3/4]',
              ];
              const aspect = skeletonAspects[idx % skeletonAspects.length];
              return (
                <div key={idx} className={`w-full ${aspect} break-inside-avoid mb-4 md:mb-6`}>
                  <ImageSkeleton
                    heightClass="w-full h-full"
                    isLightContext={false}
                  />
                </div>
              );
            })}
          </div>
        )}

        {error && !isLoading && (
          <div className="max-w-md mx-auto my-10 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center rounded-xl">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {displayedProjects.length > 0 ? (
              <>
                <div
                  key={filterKey}
                  className="w-full columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-6 lg:gap-8"
                >
                  {displayedProjects.map((project, idx) => (
                    <div key={project.id} className="project-masonry-item break-inside-avoid mb-4 md:mb-6">
                      <ProjectImageCard
                        project={project}
                        index={idx}
                        priority={idx === 0}
                        isLightContext={false}
                        projectsList={filteredProjects}
                        currentProjectIndex={idx}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredProjects.length && (
                  <div className="mt-12 md:mt-16 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="group relative px-7 py-3.5 rounded-full bg-zinc-900/90 hover:bg-[#fd551d] text-white hover:text-zinc-950 border border-zinc-700/80 hover:border-[#fd551d] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-[#fd551d]/30 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2.5"
                    >
                      <span>Load More Projects</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                      <span className="text-[10px] py-0.5 px-2 rounded-full bg-zinc-800 group-hover:bg-zinc-950/20 text-zinc-300 group-hover:text-zinc-950 transition-colors">
                        {displayedProjects.length} / {filteredProjects.length}
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full text-center py-20 text-zinc-400">
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
