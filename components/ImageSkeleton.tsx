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
      className={`relative w-full overflow-hidden rounded-2xl ${
        isLightContext ? 'bg-zinc-200/70' : 'bg-zinc-800/60'
      } ${heightClass} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
      {...props}
    >
      {/* Base shimmer background */}
      <div className={`absolute inset-0 ${isLightContext ? 'bg-zinc-200/50' : 'bg-zinc-800/50'}`} />
      
      {/* Pure clean animated shimmering light sweep */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
