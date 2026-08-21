'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { ProjectItem } from '@/lib/projectsData';
import ImageSkeleton from './ImageSkeleton';
import MediaModal from './MediaModal';

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
  priority?: boolean;
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
  priority = false,
}: ProjectImageCardProps) {
  const isMounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const isLcpCandidate = index < 2 || priority;
  const [isVisible, setIsVisible] = useState(isLcpCandidate);
  const [modalProjectIndex, setModalProjectIndex] = useState<number | null>(null);

  // IntersectionObserver to defer media loading until near viewport for non-LCP items
  useEffect(() => {
    if (!isMounted || isVisible) return;
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
      { rootMargin: '250px 0px', threshold: 0.01 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isMounted, isVisible]);

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

  // Programmatic muted play trigger for video element
  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.muted = true; // Essential for browser approval
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay auto-started with fallback:", error);
        });
      }
    }
  }, [isHovered]);

  if (hasError || (!project.image && !project.videoUrl)) {
    return null;
  }

  // Extract Drive ID for clean iframe preview embed or direct streaming
  const driveIdMatch =
    (typeof project.id === 'string' && project.id.length > 20 ? project.id : null) ||
    project.videoUrl?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    project.videoUrl?.match(/id=([a-zA-Z0-9_-]+)/)?.[1] ||
    project.image?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    project.image?.match(/id=([a-zA-Z0-9_-]+)/)?.[1];

  const drivePreviewEmbed = driveIdMatch ? `https://drive.google.com/file/d/${driveIdMatch}/preview?autoplay=1&mute=1` : null;
  const isDirectVideo = Boolean(
    (project.videoUrl && !project.videoUrl.includes('drive.google.com') && project.videoUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
    project.image?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)
  );
  const directVideoSrc = isDirectVideo
    ? (project.videoUrl?.match(/\.(mp4|webm|mov|ogg)($|\?)/i) ? project.videoUrl : project.image)
    : null;

  const posterImage = project.image || (typeof project.id === 'string' ? `https://lh3.googleusercontent.com/d/${project.id}=s1600` : '');

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay auto-started with fallback:", error);
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // Safe pause catch
      }
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
          {(!isMounted || !isVisible || !isMediaLoaded) && (
            <div className="absolute inset-0 w-full h-full z-0">
              <ImageSkeleton
                heightClass="h-full w-full"
                isLightContext={isLightContext}
              />
            </div>
          )}

          {/* Media Presentation Area - mounted only when client mounted and isVisible is triggered */}
          {isMounted && isVisible && (
            <div
              className={`relative w-full h-full overflow-hidden rounded-2xl ${!isMediaLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                } transition-opacity duration-300`}
            >
              {isVideo ? (
                /* Video Container with custom poster thumbnail & optional clean hover iframe preview */
                <div className="relative w-full h-full bg-black overflow-hidden rounded-2xl">
                  {/* Base static poster thumbnail rendered prior to video load / during buffering */}
                  <Image
                    src={project.thumbnail || posterImage || project.image}
                    alt={project.title || project.name || "Video thumbnail"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    priority={isLcpCandidate}
                    loading={isLcpCandidate ? "eager" : undefined}
                    onLoad={() => setIsMediaLoaded(true)}
                    onError={() => setHasError(true)}
                  />

                  {directVideoSrc ? (
                    <video
                      ref={videoRef}
                      src={directVideoSrc}
                      poster={project.thumbnail || posterImage || project.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label="Project video preview"
                      onLoadedMetadata={() => setIsMediaLoaded(true)}
                      onLoadedData={() => setIsMediaLoaded(true)}
                      onCanPlay={(e) => {
                        setIsMediaLoaded(true);
                        e.currentTarget.muted = true;
                        const p = e.currentTarget.play();
                        if (p !== undefined) {
                          p.catch((err) => {
                            console.warn("Autoplay auto-started with fallback:", err);
                          });
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover block rounded-2xl select-none"
                    >
                      <track kind="captions" srcLang="en" label="English captions" />
                    </video>
                  ) : isHovered && drivePreviewEmbed ? (
                    <iframe
                      src={drivePreviewEmbed}
                      title={project.title || "Video preview"}
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none rounded-2xl"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      onLoad={() => setIsMediaLoaded(true)}
                    />
                  ) : null}
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
                        priority={idx === 0 && isLcpCandidate}
                        loading={idx === 0 && isLcpCandidate ? "eager" : undefined}
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

