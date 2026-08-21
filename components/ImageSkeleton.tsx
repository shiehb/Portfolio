'use client';

import React from 'react';

export interface ImageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  heightClass?: string;
  isLightContext?: boolean;
  aspectRatio?: string;
}

export default function ImageSkeleton({
  className = '',
  heightClass = 'min-h-[260px]',
  isLightContext = false,
  aspectRatio,
  style,
  ...props
}: ImageSkeletonProps) {
  const combinedStyle = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border ${isLightContext
          ? 'bg-zinc-200/80 border-black/5'
          : 'bg-zinc-800/80 border-white/5'
        } ${heightClass} ${className} animate-pulse`}
      style={combinedStyle}
      aria-hidden="true"
      {...props}
    >
      {/* Base background tone */}
      <div
        className={`absolute inset-0 ${isLightContext ? 'bg-zinc-300/40' : 'bg-zinc-900/40'
          }`}
      />

      {/* Sweeping shimmer light sweep animation overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
