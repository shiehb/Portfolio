'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { ProjectItem } from '@/lib/projectsData';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  activeImageIndex: number;
  onSelectImageIndex: (index: number) => void;
  projectsList?: ProjectItem[];
  currentProjectIndex?: number;
  onNavigateProject?: (index: number) => void;
}

export default function MediaModal({
  isOpen,
  onClose,
  project,
  activeImageIndex,
  onSelectImageIndex,
  projectsList,
  currentProjectIndex,
  onNavigateProject,
}: MediaModalProps) {
  const images = useMemo(() => {
    return project?.images && project.images.length > 0 ? project.images : (project ? [project.image] : []);
  }, [project]);
  const hasMultipleImages = images.length > 1;
  const hasMultipleProjects = Boolean(projectsList && projectsList.length > 1 && onNavigateProject && currentProjectIndex !== undefined);
  const canNavigate = hasMultipleImages || hasMultipleProjects;

  const isVideo =
    project?.isVideo ||
    project?.category === 'video' ||
    Boolean(project?.mimeType?.startsWith('video/')) ||
    Boolean(project?.videoUrl?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
    Boolean(project?.image?.match(/\.(mp4|webm|mov|ogg)($|\?)/i));

  const handlePrev = useCallback(() => {
    if (hasMultipleImages) {
      onSelectImageIndex((activeImageIndex - 1 + images.length) % images.length);
    } else if (hasMultipleProjects && onNavigateProject && currentProjectIndex !== undefined && projectsList) {
      onNavigateProject((currentProjectIndex - 1 + projectsList.length) % projectsList.length);
    }
  }, [hasMultipleImages, activeImageIndex, images.length, onSelectImageIndex, hasMultipleProjects, onNavigateProject, currentProjectIndex, projectsList]);

  const handleNext = useCallback(() => {
    if (hasMultipleImages) {
      onSelectImageIndex((activeImageIndex + 1) % images.length);
    } else if (hasMultipleProjects && onNavigateProject && currentProjectIndex !== undefined && projectsList) {
      onNavigateProject((currentProjectIndex + 1) % projectsList.length);
    }
  }, [hasMultipleImages, activeImageIndex, images.length, onSelectImageIndex, hasMultipleProjects, onNavigateProject, currentProjectIndex, projectsList]);

  // Helper to pre-fetch adjacent previous and next images in background
  const prefetchAdjacentImages = useCallback(() => {
    if (typeof window === 'undefined') return;

    const urlsToPreload: string[] = [];

    if (hasMultipleImages) {
      const prevIdx = (activeImageIndex - 1 + images.length) % images.length;
      const nextIdx = (activeImageIndex + 1) % images.length;
      if (images[prevIdx]) urlsToPreload.push(images[prevIdx]);
      if (images[nextIdx]) urlsToPreload.push(images[nextIdx]);
    } else if (hasMultipleProjects && projectsList && currentProjectIndex !== undefined) {
      const prevProj = projectsList[(currentProjectIndex - 1 + projectsList.length) % projectsList.length];
      const nextProj = projectsList[(currentProjectIndex + 1) % projectsList.length];
      const prevImg = prevProj?.images?.[0] || prevProj?.image;
      const nextImg = nextProj?.images?.[0] || nextProj?.image;
      if (prevImg) urlsToPreload.push(prevImg);
      if (nextImg) urlsToPreload.push(nextImg);
    }

    urlsToPreload.forEach((url) => {
      if (!url || url.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) return;
      const img = new (window as unknown as { Image: new () => HTMLImageElement }).Image();
      img.src = url;
    });
  }, [
    hasMultipleImages,
    activeImageIndex,
    images,
    hasMultipleProjects,
    projectsList,
    currentProjectIndex,
  ]);

  // Initial and reactive background preloading when modal is active
  useEffect(() => {
    if (!isOpen) return;
    prefetchAdjacentImages();
  }, [isOpen, prefetchAdjacentImages]);

  const handleActiveImageLoad = useCallback(() => {
    prefetchAdjacentImages();
  }, [prefetchAdjacentImages]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape) & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !project || typeof document === 'undefined') return null;

  const currentImage = images[activeImageIndex] || project.image;
  const title = project.title || project.name?.replace(/\.[a-zA-Z0-9]+$/, '') || 'Project';

  let modalVideoSrc: string | null = null;
  if (project.videoUrl && !project.videoUrl.includes('drive.google.com/file')) {
    modalVideoSrc = project.videoUrl;
  } else if (project.image?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) {
    modalVideoSrc = project.image;
  } else if (project.videoUrl && project.videoUrl.includes('drive.google.com/file')) {
    const match = project.videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      modalVideoSrc = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    } else {
      modalVideoSrc = project.videoUrl;
    }
  } else if (isVideo) {
    modalVideoSrc = project.videoUrl || (typeof project.id === 'string' ? `https://drive.google.com/uc?export=download&id=${project.id}` : null);
  }

  const modalContent = (
    <div
      id="media-modal-backdrop"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/92 backdrop-blur-lg p-4 sm:p-6 font-display select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Floating Close Button - Independent high-z-index clickable target positioned clear of any underlying header */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-5 right-5 sm:top-7 sm:right-7 z-[1000000] p-3 rounded-full bg-zinc-900/90 hover:bg-[#fd551d] text-white border border-white/20 hover:border-[#fd551d] transition-all duration-200 cursor-pointer shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center"
        aria-label="Close modal"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </button>

      {/* Main Content Area */}
      <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col items-center justify-center z-10">
        {isVideo ? (
          /* Video Viewer */
          <div className="w-full aspect-video max-h-[80vh] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative flex items-center justify-center">
            {modalVideoSrc ? (
              <video
                src={modalVideoSrc}
                poster={project.image}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : project.videoUrl?.includes('drive.google.com') ? (
              <iframe
                src={project.videoUrl}
                title={title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-white/70">
                <Play className="w-12 h-12 text-[#fd551d] mb-3" />
                <p className="text-sm">Video stream preview unavailable</p>
              </div>
            )}
          </div>
        ) : (
          /* Image Gallery Viewer */
          <div className="relative w-full h-[75vh] flex items-center justify-center">
            {/* Previous Image / Project Arrow */}
            {canNavigate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/70 hover:bg-[#fd551d] text-white transition-all border border-white/15 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Current Image */}
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <Image
                src={currentImage}
                alt={title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain rounded-lg select-none"
                priority
                onLoad={handleActiveImageLoad}
              />
            </div>

            {/* Next Image / Project Arrow */}
            {canNavigate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/70 hover:bg-[#fd551d] text-white transition-all border border-white/15 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Thumbnail selector when multiple images exist */}
        {hasMultipleImages && !isVideo && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto max-w-full py-2 px-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImageIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer border-2 ${idx === activeImageIndex
                    ? 'border-[#fd551d] scale-105 shadow-md shadow-[#fd551d]/40'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
