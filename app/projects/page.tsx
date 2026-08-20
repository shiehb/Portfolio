'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { triggerPageTransition } from '@/lib/transitionEvents';
import { getProjects, getCachedProjects, ProjectItem } from '@/lib/projectsData';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2, ArrowLeft } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>(() => getCachedProjects() || []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(() => !getCachedProjects() || getCachedProjects()?.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const animationsInitializedRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    triggerPageTransition(() => {
      router.push('/');
    }, '/', 'HOME');
  };

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
        const message = err instanceof Error ? err.message : "Failed to load projects from Google Drive.";
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
    setFilterKey(prev => prev + 1); // Trigger animation re-run
  };

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "graphics", label: "Graphics" },
    { id: "photo", label: "Photography" },
    { id: "video", label: "Videos" },
    { id: "website", label: "Website" },
  ];

  const getPaddingBottom = (index: number) => {
    const ratios = ['125%', '100%', '75%', '133%'];
    return ratios[index % ratios.length];
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 py-12 px-3 sm:px-6 bg-transparent min-h-screen text-white font-display pt-24"
    >
      {/* Back to Home Button */}
      <div className="max-w-[1280px] mx-auto mb-6">
        <Link
          href="/"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-300 group cursor-pointer"
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
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="batch-image opacity-0 invisible w-full relative overflow-hidden will-change-transform shadow-sm group rounded-sm bg-zinc-900 break-inside-avoid"
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