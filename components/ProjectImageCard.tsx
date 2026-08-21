'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ProjectItem } from '@/lib/projectsData';
import ImageSkeleton from './ImageSkeleton';
import MediaModal from './MediaModal';
import { Play } from 'lucide-react';

interface ProjectImageCardProps {
  project: ProjectItem;
  className?: string;
  isLightContext?: boolean;
  index?: number;
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

export default function ProjectImageCard({
  project,
  className = '',
  isLightContext = false,
  index = 0,
}: ProjectImageCardProps) {
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
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-toggle between stacked images with interval timer
  useEffect(() => {
    if (!hasMultipleImages || isVideo) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [hasMultipleImages, isVideo, images.length]);

  // Robust video autoplay handling using muted property and intersection observer
  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: will play on viewport intersection or interaction
        });
      }
    };

    tryPlay();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = true;
            tryPlay();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isVideo]);

  if (hasError || (!project.image && !project.videoUrl)) {
    return null;
  }

  const skeletonHeight = SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length];
  
  // Resolve playable direct video URL
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
    videoSource = project.videoUrl || null;
  }

  const handleCardClick = () => {
    if (isVideo) {
      setIsModalOpen(true);
    } else if (hasMultipleImages) {
      // Toggle to next image on click
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`batch-image group relative break-inside-avoid mb-5 cursor-pointer select-none ${className}`}
      >
        {/* Layered Stack Effect for multi-image collections */}
        {hasMultipleImages && (
          <>
            {/* Background 2nd layer card */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 transform translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:opacity-70 ${
                isLightContext
                  ? 'bg-zinc-300 border border-zinc-400/40'
                  : 'bg-zinc-800 border border-zinc-700/60'
              }`}
            />
            {/* Background 1st layer card */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 transform translate-x-1 translate-y-1 opacity-60 group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:opacity-85 ${
                isLightContext
                  ? 'bg-zinc-200 border border-zinc-300/80'
                  : 'bg-zinc-850 border border-zinc-750'
              }`}
            />
          </>
        )}

        {/* Main Card Container */}
        <div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 shadow-md ${
            isLightContext
              ? 'bg-zinc-100 border border-zinc-200/90 group-hover:shadow-xl group-hover:border-zinc-300'
              : 'bg-zinc-900 border border-zinc-800/80 group-hover:shadow-2xl group-hover:border-zinc-700'
          }`}
        >
          {/* Skeleton display before media loads */}
          {!isMediaLoaded && (
            <div className="w-full">
              <ImageSkeleton
                heightClass={skeletonHeight}
                isLightContext={isLightContext}
              />
            </div>
          )}

          {/* Media Presentation Area */}
          <div
            className={`relative w-full overflow-hidden rounded-2xl ${
              !isMediaLoaded ? 'absolute inset-0 opacity-0 pointer-events-none' : 'relative opacity-100'
            } transition-opacity duration-300`}
          >
            {isVideo ? (
              /* Auto-playing muted video without controls */
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black overflow-hidden rounded-2xl">
                {videoSource ? (
                  <video
                    ref={videoRef}
                    src={videoSource}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label="Project video preview"
                    onLoadedData={() => setIsMediaLoaded(true)}
                    onCanPlay={(e) => {
                      setIsMediaLoaded(true);
                      e.currentTarget.muted = true;
                      e.currentTarget.play().catch(() => {});
                    }}
                    onError={() => {
                      // Fallback to thumbnail image if direct video source fails
                      setIsMediaLoaded(true);
                    }}
                    className="w-full h-full object-cover block rounded-2xl"
                  >
                    <track kind="captions" srcLang="en" label="English captions" />
                  </video>
                ) : (
                  <Image
                    src={project.image}
                    alt="Video thumbnail"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded-2xl"
                    onLoad={() => setIsMediaLoaded(true)}
                    onError={() => setHasError(true)}
                  />
                )}

                {/* Center Video Play Icon (visible on hover) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fd551d] text-white flex items-center justify-center shadow-xl shadow-[#fd551d]/40 scale-90 group-hover:scale-100 group-active:scale-95 transition-transform duration-300">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              /* Stacked Images with CSS Crossfade Transition */
              <div className="relative w-full overflow-hidden rounded-2xl">
                {images.map((imgSrc, idx) => (
                  <div
                    key={imgSrc + idx}
                    className={`${
                      idx === 0 ? 'relative w-full' : 'absolute inset-0 w-full h-full'
                    } transition-opacity duration-700 ease-in-out ${
                      idx === currentImageIndex
                        ? 'opacity-100 z-10'
                        : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={imgSrc}
                      alt="Project media"
                      width={800}
                      height={1000}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className={`${
                        idx === 0 ? 'w-full h-auto' : 'w-full h-full'
                      } block object-cover rounded-2xl select-none`}
                      priority={idx === 0}
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
        </div>
      </div>

      {/* Lightbox / Video Player Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
        activeImageIndex={currentImageIndex}
        onSelectImageIndex={(idx) => setCurrentImageIndex(idx)}
      />
    </>
  );
}
