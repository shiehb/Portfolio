// lib/LoadingContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects } from '@/lib/projectsData';

type LoadingContextType = {
  isLoading: boolean;
  hasInitialLoaded: boolean;
  setLoading: (loading: boolean) => void;
  incrementLoaded: () => void;
  totalItems: number;
  setTotalItems: (count: number) => void;
  resetLoading: () => void;
  progress: number;
  isTransitioning: boolean;
  startTransition: () => void;
  endTransition: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [totalItems, setTotalItems] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const hasLoadedRef = useRef(false);
  const hasInitialLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const incrementLoaded = useCallback(() => {
    if (hasLoadedRef.current || isTransitioning || hasInitialLoadedRef.current) return;
  }, [isTransitioning]);

  const resetLoading = useCallback(() => {
    if (isTransitioning || hasInitialLoadedRef.current) return;
    hasLoadedRef.current = false;
    setProgress(0);
    setIsLoading(true);
  }, [isTransitioning]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    setIsLoading(false);
    hasLoadedRef.current = true;
    hasInitialLoadedRef.current = true;
    setHasInitialLoaded(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // Comprehensive Preloader: Preloads current page, other pages, fonts, images, and API data
  useEffect(() => {
    if (hasInitialLoadedRef.current || isTransitioning) return;

    let isCancelled = false;

    async function runFullPreload() {
      // 1. Minimum aesthetic display time promise (at least 600ms for smooth brand visibility)
      const minTimerPromise = new Promise(resolve => setTimeout(resolve, 600));

      // 2. Preload other pages routes via Next.js router prefetch
      const prefetchPagesPromise = (async () => {
        try {
          if (router && typeof router.prefetch === 'function') {
            router.prefetch('/');
            router.prefetch('/about');
            router.prefetch('/projects');
            router.prefetch('/contact');
          }
        } catch {
          // Ignore prefetch errors
        }
      })();

      // 3. Preload critical fonts
      const fontsPromise = (async () => {
        try {
          if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
            await document.fonts.ready;
          }
        } catch {
          // Ignore font ready errors
        }
      })();

      // 4. Preload critical site images
      const criticalImages = [
        '/img/hero.webp',
        '/img/logo.webp',
      ];

      const imagePreloadPromises = criticalImages.map(src => {
        return new Promise<void>((resolve) => {
          if (typeof window === 'undefined') return resolve();
          const img = new window.Image();
          img.src = src;
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
      });

      // 5. Preload project items data from API
      const projectsPromise = (async () => {
        try {
          await getProjects();
        } catch {
          // Non-blocking if API is offline
        }
      })();

      // 6. Preload any images currently in DOM
      const domImagesPromise = new Promise<void>((resolve) => {
        if (typeof document === 'undefined') return resolve();

        const checkDOMImages = () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          if (imgs.length === 0) return resolve();

          let count = 0;
          const total = imgs.length;

          const checkDone = () => {
            count++;
            if (count >= total) resolve();
          };

          imgs.forEach((img) => {
            if (img.complete) {
              checkDone();
            } else {
              img.addEventListener('load', checkDone, { once: true });
              img.addEventListener('error', checkDone, { once: true });
            }
          });

          // Fallback if image events are delayed
          setTimeout(resolve, 1200);
        };

        if (document.readyState === 'complete') {
          checkDOMImages();
        } else {
          window.addEventListener('load', checkDOMImages, { once: true });
          setTimeout(checkDOMImages, 400);
        }
      });

      // 7. Window load state
      const windowLoadPromise = new Promise<void>((resolve) => {
        if (typeof document === 'undefined' || document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve(), { once: true });
          setTimeout(resolve, 1500); // Safety fallback
        }
      });

      // Wait for all preloads AND minimum time to complete
      await Promise.all([
        minTimerPromise,
        prefetchPagesPromise,
        fontsPromise,
        Promise.all(imagePreloadPromises),
        projectsPromise,
        domImagesPromise,
        windowLoadPromise,
      ]);

      if (isCancelled || hasLoadedRef.current || hasInitialLoadedRef.current) return;

      // Mark preloading complete
      hasLoadedRef.current = true;
      hasInitialLoadedRef.current = true;
      setProgress(100);

      setTimeout(() => {
        if (isMountedRef.current && !isCancelled) {
          setIsLoading(false);
          setHasInitialLoaded(true);
        }
      }, 100);
    }

    runFullPreload();

    return () => {
      isCancelled = true;
    };
  }, [router, isTransitioning]);

  // Smooth progress animation
  useEffect(() => {
    if (!isLoading || isTransitioning || hasInitialLoadedRef.current) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return Math.min(prev + Math.floor(Math.random() * 6 + 3), 90);
        }
        return prev;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoading, isTransitioning]);

  // Lock scroll during initial loader or page transitions
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isLocked = isLoading || isTransitioning;
    if (isLocked) {
      document.documentElement.classList.add('is-locked');
      document.body.classList.add('is-locked');
    } else {
      document.documentElement.classList.remove('is-locked');
      document.body.classList.remove('is-locked');
    }
  }, [isLoading, isTransitioning]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('is-locked');
        document.body.classList.remove('is-locked');
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      hasInitialLoaded,
      setLoading: setIsLoading,
      incrementLoaded,
      totalItems,
      setTotalItems,
      resetLoading,
      progress,
      isTransitioning,
      startTransition,
      endTransition,
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
