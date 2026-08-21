'use client';

import React, { useState } from 'react';
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError || !project.image) {
    return null;
  }

  const skeletonHeight = SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length];

  return (
    <div
      className={`batch-image group relative break-inside-avoid mb-4 overflow-hidden rounded-2xl transition-shadow duration-300 ${
        isLightContext
          ? 'bg-zinc-100/90 hover:shadow-xl hover:shadow-black/5'
          : 'bg-zinc-900/90 hover:shadow-2xl hover:shadow-black/40'
      } ${className}`}
    >
      {/* Shimmering Skeleton Loader displayed while the image is fetching/loading */}
      {!isImageLoaded && (
        <div className="w-full">
          <ImageSkeleton
            heightClass={skeletonHeight}
            isLightContext={isLightContext}
          />
        </div>
      )}

      {/* Uncropped Pinterest Image Container - No zoom on hover */}
      <div className={`relative w-full ${!isImageLoaded ? 'absolute inset-0 opacity-0 pointer-events-none' : 'block opacity-100'} transition-opacity duration-500`}>
        <Image
          src={project.image}
          alt="Jericho Urbano visual project"
          width={800}
          height={1000}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="w-full h-auto block rounded-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
