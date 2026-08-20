// lib/LoadingContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

type LoadingContextType = {
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalItems, setTotalItems] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const incrementLoaded = useCallback(() => {
    if (hasLoadedRef.current || isTransitioning) return;
    setLoadedCount(prev => prev + 1);
  }, [isTransitioning]);

  const resetLoading = useCallback(() => {
    if (isTransitioning) return;
    hasLoadedRef.current = false;
    setLoadedCount(0);
    setProgress(0);
    setIsLoading(true);
  }, [isTransitioning]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    // Force hide loader immediately
    setIsLoading(false);
    hasLoadedRef.current = true;
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    // Reset loading state for next page load
    hasLoadedRef.current = false;
    setLoadedCount(0);
    setProgress(0);
    setIsLoading(true);
  }, []);

  // Smooth progress animation from 0 to 100
  useEffect(() => {
    if (!isLoading || isTransitioning) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const target = totalItems > 0 ? Math.min(95, (loadedCount / totalItems) * 90 + 10) : 70;
        if (prev < target) {
          return Math.min(prev + Math.floor(Math.random() * 8 + 4), target);
        }
        return prev;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoading, loadedCount, totalItems, isTransitioning]);

  useEffect(() => {
    // Skip loading if transitioning
    if (isTransitioning) {
      setIsLoading(false);
      return;
    }

    // Graceful timer to complete loading if assets take time
    const forceTimer = setTimeout(() => {
      if (isLoading && !hasLoadedRef.current && !isTransitioning) {
        hasLoadedRef.current = true;
        setProgress(100);
        setTimeout(() => {
          if (isMountedRef.current && !isTransitioning) {
            setIsLoading(false);
          }
        }, 200);
      }
    }, 900);

    if (loadedCount >= totalItems && totalItems > 0 && !hasLoadedRef.current && !isTransitioning) {
      hasLoadedRef.current = true;
      setProgress(100);
      const timer = setTimeout(() => {
        if (isMountedRef.current && !isTransitioning) {
          setIsLoading(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    }

    return () => clearTimeout(forceTimer);
  }, [loadedCount, totalItems, isLoading, isTransitioning]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <LoadingContext.Provider value={{
      isLoading,
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