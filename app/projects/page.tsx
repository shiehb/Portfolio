// app/projects/page.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import { useLoading } from "@/lib/LoadingContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const projectsData = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "website",
    description: "Full-featured e-commerce platform with real-time inventory management",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: 2,
    title: "Portfolio Website",
    category: "website",
    description: "Minimalist portfolio with smooth animations and dark mode",
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["React", "Framer Motion", "GSAP"],
  },
  {
    id: 3,
    title: "Dashboard UI",
    category: "website",
    description: "Analytics dashboard with real-time data visualization",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Vue.js", "D3.js", "Firebase"],
  },
  {
    id: 4,
    title: "Landing Page",
    category: "website",
    description: "High-converting landing page with interactive elements",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: 5,
    title: "Blog Platform",
    category: "website",
    description: "Modern blog platform with CMS integration",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Next.js", "MDX", "Tailwind"],
  },
  {
    id: 6,
    title: "E-Learning Platform",
    category: "website",
    description: "Interactive learning platform with video content",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 7,
    title: "Urban Landscapes",
    category: "photo",
    description: "Street photography capturing the essence of city life",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Street", "Urban", "Black & White"],
  },
  {
    id: 8,
    title: "Portrait Series",
    category: "photo",
    description: "Emotional portrait photography in natural light",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Portrait", "Natural Light", "Emotional"],
  },
  {
    id: 9,
    title: "Nature & Wildlife",
    category: "photo",
    description: "Wildlife photography from remote locations",
    image: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Wildlife", "Nature", "Travel"],
  },
  {
    id: 10,
    title: "Architecture",
    category: "photo",
    description: "Geometric compositions of modern architecture",
    image: "https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Architecture", "Geometric", "Minimalist"],
  },
  {
    id: 11,
    title: "Night Photography",
    category: "photo",
    description: "Long exposure night shots of urban environments",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Night", "Long Exposure", "Urban"],
  },
  {
    id: 12,
    title: "Brand Documentary",
    category: "video",
    description: "Cinematic brand documentary with interview and B-roll",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Documentary", "Cinematic", "Brand Story"],
  },
  {
    id: 13,
    title: "Music Video",
    category: "video",
    description: "Music video with experimental visual effects",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Music", "VFX", "Experimental"],
  },
  {
    id: 14,
    title: "Product Commercial",
    category: "video",
    description: "Product commercial with 3D animation integration",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f1a1?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Commercial", "3D", "Product"],
  },
  {
    id: 15,
    title: "Travel Vlog",
    category: "video",
    description: "Cinematic travel vlog exploring hidden destinations",
    image: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Travel", "Vlog", "Cinematic"],
  },
  {
    id: 16,
    title: "Animation Short",
    category: "video",
    description: "2D animated short film with original soundtrack",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2024",
    tags: ["Animation", "2D", "Original"],
  },
  {
    id: 17,
    title: "Corporate Video",
    category: "video",
    description: "Professional corporate video with motion graphics",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop",
    link: "#",
    year: "2023",
    tags: ["Corporate", "Motion Graphics", "Professional"],
  },
];

const categories = [
  { id: "all", label: "All Projects", icon: "✦" },
  { id: "website", label: "Websites", icon: "⚡" },
  { id: "photo", label: "Photography", icon: "📷" },
  { id: "video", label: "Videos", icon: "🎬" },
];

export default function ProjectsPage() {
  const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState(projectsData);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Reset loading state when component mounts
    resetLoading();

    setTotalItems(1);

    const imageUrls = projectsData.map(p => p.image);
    let loaded = 0;

    imageUrls.forEach(src => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === imageUrls.length && !hasIncremented.current) {
          hasIncremented.current = true;
          incrementLoaded();
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === imageUrls.length && !hasIncremented.current) {
          hasIncremented.current = true;
          incrementLoaded();
        }
      };
    });

    const timer = setTimeout(() => {
      if (!hasIncremented.current) {
        hasIncremented.current = true;
        incrementLoaded();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [setTotalItems, incrementLoaded, resetLoading]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProjects(projectsData);
    } else {
      setFilteredProjects(projectsData.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory]);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return projectsData.length;
    return projectsData.filter(p => p.category === categoryId).length;
  };

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#222222] text-white font-display">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 px-4"
      >
        <span className="block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0]">
          MY WORK
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-white">
          Projects
          <span className="block text-[#fd551d]">Gallery</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0]">
          Explore my work across web development, photography, and videography
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4 pb-8"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm uppercase tracking-[0.1em] font-display transition-all duration-300 ${selectedCategory === category.id
                ? "bg-[#fd551d] text-white shadow-lg shadow-[#fd551d]/30"
                : "bg-zinc-800/50 text-[#c0c0c0] hover:bg-zinc-700/50 hover:text-white"
              }`}
          >
            <span className="mr-1 sm:mr-2">{category.icon}</span>
            {category.label}
            <span className="ml-1 sm:ml-2 text-[10px] opacity-60">
              ({getCategoryCount(category.id)})
            </span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-4 pb-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onHoverStart={() => setHoveredId(project.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="group relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-[#fd551d]/50 transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    unoptimized
                    className={`object-cover transition-transform duration-700 ${hoveredId === project.id ? "scale-110" : "scale-100"
                      }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-[8px] sm:text-[10px] uppercase tracking-[0.1em] text-[#c0c0c0] border border-white/10">
                    {project.category}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-4 sm:p-6"
                  >
                    <div className="w-full">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#c0c0c0] line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#fd551d]/20 border border-[#fd551d]/30 rounded-full text-[8px] sm:text-[10px] text-[#fd551d]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={project.link}
                        className="inline-block px-4 py-1.5 bg-[#fd551d] text-white text-xs sm:text-sm rounded-full hover:bg-[#fd551d]/80 transition-colors"
                      >
                        View Project →
                      </Link>
                    </div>
                  </motion.div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {project.title}
                    </h3>
                    <span className="text-xs text-[#c0c0c0] font-display">
                      {project.year}
                    </span>
                  </div>
                  <p className="text-xs text-[#c0c0c0] line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-[#c0c0c0]">No projects found in this category.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}