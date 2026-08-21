'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { ProjectItem } from '@/lib/projectsData';
import ImageSkeleton from './ImageSkeleton';
import MediaModal from './MediaModal';
import { Play } from 'lucide-react';

const emptySubscribe = () => () => { };

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface ProjectImageCardProps {
  project: ProjectItem;
  className?: string;
  isLightContext?: boolean;
  index?: number;
  aspectRatioClass?: string;
  projectsList?: ProjectItem[];
  currentProjectIndex?: number;
}

const DYNAMIC_ASPECT_RATIOS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[2/3]',
  'aspect-[4/5]',
  'aspect-[1/1]',
  'aspect-[3/4]',
  'aspect-[2/3]',
  'aspect-[4/5]',
];

export default function ProjectImageCard({
  project,
  className = '',
  isLightContext = false,
  index = 0,
  aspectRatioClass,
  projectsList,
  currentProjectIndex,
}: ProjectImageCardProps) {
  const mounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [modalProjectIndex, setModalProjectIndex] = useState<number | null>(null);

  // IntersectionObserver to defer media loading until near viewport
  useEffect(() => {
    if (!mounted || isVisible) return;
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [mounted, isVisible]);

  const images =
    project.images && project.images.length > 0 ? project.images : [project.image];
  const hasMultipleImages = images.length > 1;

  // Video Detection: check category, flags, mimeType, or video file extensions
  const isVideo =
    Boolean(project.isVideo) ||
    project.category === 'video' ||
    Boolean(project.mimeType?.startsWith('video/')) ||
    Boolean(project.videoUrl?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
    Boolean(project.image?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
    Boolean(project.name?.match(/\.(mp4|webm|mov|ogg)($|\?)/i));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-toggle between stacked images with interval timer only when visible
  useEffect(() => {
    if (!isVisible || !hasMultipleImages || isVideo) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isVisible, hasMultipleImages, isVideo, images.length]);

  if (hasError || (!project.image && !project.videoUrl)) {
    return null;
  }

  // Resolve playable direct video URL & poster thumbnail
  let videoSource: string | null = null;
  if (project.videoUrl && !project.videoUrl.includes('drive.google.com/file')) {
    videoSource = project.videoUrl;
  } else if (project.image?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) {
    videoSource = project.image;
  } else if (project.videoUrl && project.videoUrl.includes('drive.google.com/file')) {
    const match = project.videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      videoSource = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    } else {
      videoSource = project.videoUrl;
    }
  } else if (isVideo) {
    videoSource = project.videoUrl || (typeof project.id === 'string' ? `https://drive.google.com/uc?export=download&id=${project.id}` : null);
  }

  const posterImage = project.image || (typeof project.id === 'string' ? `https://lh3.googleusercontent.com/d/${project.id}=s1600` : '');

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback gracefully handled
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalProjectIndex(currentProjectIndex ?? index);
    setModalImageIndex(currentImageIndex);
  };

  const handleNavigateProject = (newIdx: number) => {
    if (!projectsList || projectsList.length === 0) return;
    const boundedIdx = (newIdx + projectsList.length) % projectsList.length;
    setModalProjectIndex(boundedIdx);
    setModalImageIndex(0);
  };

  const chosenAspect =
    aspectRatioClass ||
    DYNAMIC_ASPECT_RATIOS[index % DYNAMIC_ASPECT_RATIOS.length];

  const activeModalProject =
    modalProjectIndex !== null && projectsList && projectsList[modalProjectIndex]
      ? projectsList[modalProjectIndex]
      : project;

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        suppressHydrationWarning
        className={`batch-image group relative w-full ${chosenAspect} cursor-pointer select-none ${className}`}
      >
        {/* Layered Stack Effect for multi-image collections */}
        {hasMultipleImages && (
          <>
            {/* Background 2nd layer card */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 transform translate-x-1.5 translate-y-1.5 opacity-40 group-hover:translate-x-2.5 group-hover:translate-y-2.5 group-hover:opacity-70 ${isLightContext
                  ? 'bg-zinc-300 border border-zinc-400/40'
                  : 'bg-zinc-800 border border-zinc-700/60'
                }`}
            />
            {/* Background 1st layer card */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 transform translate-x-0.5 translate-y-0.5 opacity-60 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:opacity-85 ${isLightContext
                  ? 'bg-zinc-200 border border-zinc-300/80'
                  : 'bg-zinc-850 border border-zinc-750'
                }`}
            />
          </>
        )}

        {/* Main Card Container */}
        <div
          className={`relative w-full h-full overflow-hidden rounded-2xl transition-all duration-300 shadow-md ${isLightContext
              ? 'bg-zinc-100 border border-zinc-200/90 group-hover:shadow-xl group-hover:border-zinc-300'
              : 'bg-zinc-900 border border-zinc-800/80 group-hover:shadow-2xl group-hover:border-zinc-700'
            }`}
        >
          {/* Skeleton display before media loads or before scrolling into viewport */}
          {(!mounted || !isVisible || !isMediaLoaded) && (
            <div className="absolute inset-0 w-full h-full z-0">
              <ImageSkeleton
                heightClass="h-full w-full"
                isLightContext={isLightContext}
              />
            </div>
          )}

          {/* Media Presentation Area - mounted only when client mounted and isVisible is triggered */}
          {mounted && isVisible && (
            <div
              className={`relative w-full h-full overflow-hidden rounded-2xl ${!isMediaLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                } transition-opacity duration-300`}
            >
              {isVideo ? (
                /* Video Container with Instant Poster & Hover-Triggered Lazy Playback */
                <div className="relative w-full h-full bg-black overflow-hidden rounded-2xl">
                  {videoSource ? (
                    <video
                      ref={videoRef}
                      src={isHovered ? videoSource : (videoSource || undefined)}
                      poster={posterImage}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label="Project video preview"
                      onLoadedMetadata={() => setIsMediaLoaded(true)}
                      onLoadedData={() => setIsMediaLoaded(true)}
                      onCanPlay={() => setIsMediaLoaded(true)}
                      onError={() => {
                        // Fallback to thumbnail image if video fails
                        setIsMediaLoaded(true);
                      }}
                      className="w-full h-full object-cover block rounded-2xl select-none"
                    >
                      <track kind="captions" srcLang="en" label="English captions" />
                    </video>
                  ) : (
                    <Image
                      src={posterImage || project.image}
                      alt={project.title || "Video thumbnail"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-cover rounded-2xl"
                      onLoad={() => setIsMediaLoaded(true)}
                      onError={() => setHasError(true)}
                    />
                  )}

                  {/* Center Video Play Icon (visible when not playing or on subtle hover state) */}
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-85 group-hover:opacity-100'
                    }`}>
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#fd551d] text-white flex items-center justify-center shadow-xl shadow-[#fd551d]/40 scale-90 group-hover:scale-100 group-active:scale-95 transition-transform duration-300">
                      <Play className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Stacked Images with CSS Crossfade Transition */
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  {images.map((imgSrc, idx) => (
                    <div
                      key={imgSrc + idx}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === currentImageIndex
                          ? 'opacity-100 z-10'
                          : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                      <Image
                        src={imgSrc}
                        alt={project.title || project.name || "Project media"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        className="w-full h-full block object-cover rounded-2xl select-none group-hover:scale-105 transition-transform duration-500"
                        priority={idx === 0 && index < 4}
                        onLoad={() => {
                          if (idx === 0) setIsMediaLoaded(true);
                        }}
                        onError={() => {
                          if (idx === 0) setHasError(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Video Player Modal */}
      <MediaModal
        isOpen={modalProjectIndex !== null}
        onClose={() => setModalProjectIndex(null)}
        project={activeModalProject}
        activeImageIndex={modalImageIndex}
        onSelectImageIndex={(idx) => setModalImageIndex(idx)}
        projectsList={projectsList}
        currentProjectIndex={modalProjectIndex ?? (currentProjectIndex ?? index)}
        onNavigateProject={handleNavigateProject}
      />
    </>
  );
}
