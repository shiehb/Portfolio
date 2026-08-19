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
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalItems, setTotalItems] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const incrementLoaded = useCallback(() => {
    if (hasLoadedRef.current) return;
    setLoadedCount(prev => {
      const newCount = prev + 1;
      return newCount;
    });
  }, []);

  const resetLoading = useCallback(() => {
    hasLoadedRef.current = false;
    setLoadedCount(0);
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Force loading complete after 5 seconds max
    const forceTimer = setTimeout(() => {
      if (isLoading && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    }, 5000);

    if (loadedCount >= totalItems && totalItems > 0 && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => clearTimeout(forceTimer);
  }, [loadedCount, totalItems, isMounted, isLoading]);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setLoading: setIsLoading,
      incrementLoaded,
      totalItems,
      setTotalItems,
      resetLoading
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