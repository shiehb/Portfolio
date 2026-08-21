'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ProjectItem } from '@/lib/projectsData';
import ImageSkeleton from './ImageSkeleton';

interface ProjectImageCardProps {
  project: ProjectItem;
  className?: string;
  isLightContext?: boolean;
  index?: number;
}

// Staggered placeholder heights for Pinterest-style realistic skeleton before image loads
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
  // First 4 items load immediately; or if IntersectionObserver is unsupported in browser
  const [isInView, setIsInView] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.IntersectionObserver === 'undefined') {
      return true;
    }
    return index < 4;
  });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    const element = cardRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '300px 0px', // Preload images 300px before scrolling into viewport
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isInView]);

  if (hasError || !project.image) {
    return null;
  }

  const skeletonHeight = SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length];

  return (
    <div
      ref={cardRef}
      className={`batch-image group relative break-inside-avoid mb-4 overflow-hidden rounded-2xl transition-shadow duration-300 ${
        isLightContext
          ? 'bg-zinc-100/90 hover:shadow-xl hover:shadow-black/5'
          : 'bg-zinc-900/90 hover:shadow-2xl hover:shadow-black/40'
      } ${className}`}
    >
      {/* Shimmering Skeleton Loader displayed while the image is waiting for viewport intersection or decoding */}
      {(!isInView || !isImageLoaded) && (
        <div className="w-full">
          <ImageSkeleton
            heightClass={skeletonHeight}
            isLightContext={isLightContext}
          />
        </div>
      )}

      {/* Uncropped Pinterest Image Container - Mounted only after intersecting viewport */}
      {isInView && (
        <div
          className={`relative w-full ${
            !isImageLoaded
              ? 'absolute inset-0 opacity-0 pointer-events-none'
              : 'block opacity-100'
          } transition-opacity duration-500`}
        >
          <Image
            src={project.image}
            alt="Jericho Urbano visual project"
            width={800}
            height={1000}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="w-full h-auto block rounded-2xl"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading={index < 4 ? 'eager' : 'lazy'}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      )}
    </div>
  );
}
