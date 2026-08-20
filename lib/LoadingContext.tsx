// lib/LoadingContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalItems, setTotalItems] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const hasLoadedRef = useRef(false);
  const hasInitialLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const incrementLoaded = useCallback(() => {
    if (hasLoadedRef.current || isTransitioning || hasInitialLoadedRef.current) return;
    setLoadedCount(prev => prev + 1);
  }, [isTransitioning]);

  const resetLoading = useCallback(() => {
    // If the initial site load is already done or we're navigating, never show loader again
    if (isTransitioning || hasInitialLoadedRef.current) return;
    hasLoadedRef.current = false;
    setLoadedCount(0);
    setProgress(0);
    setIsLoading(true);
  }, [isTransitioning]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    // Ensure loader is completely disabled and marked as initially loaded
    setIsLoading(false);
    hasLoadedRef.current = true;
    hasInitialLoadedRef.current = true;
    setHasInitialLoaded(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // Smooth progress animation from 0 to 100 on initial site entry
  useEffect(() => {
    if (!isLoading || isTransitioning || hasInitialLoadedRef.current) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const target = totalItems > 0 ? Math.min(95, (loadedCount / totalItems) * 90 + 10) : 70;
        if (prev < target) {
          return Math.min(prev + Math.floor(Math.random() * 8 + 4), target);
        }
        return prev;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [isLoading, loadedCount, totalItems, isTransitioning]);

  useEffect(() => {
    if (isTransitioning || hasInitialLoadedRef.current) {
      return;
    }

    const completeInitialLoad = () => {
      hasLoadedRef.current = true;
      hasInitialLoadedRef.current = true;
      setProgress(100);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setHasInitialLoaded(true);
        }
      }, 200);
    };

    // Safety fallback timer for initial site load
    const forceTimer = setTimeout(() => {
      if (isLoading && !hasLoadedRef.current && !isTransitioning && !hasInitialLoadedRef.current) {
        completeInitialLoad();
      }
    }, 850);

    if (loadedCount >= totalItems && totalItems > 0 && !hasLoadedRef.current && !isTransitioning) {
      completeInitialLoad();
      return () => clearTimeout(forceTimer);
    }

    return () => clearTimeout(forceTimer);
  }, [loadedCount, totalItems, isLoading, isTransitioning]);

  // Lock scroll during initial loader or page transitions to prevent double loading scroll
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
