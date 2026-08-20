// components/PageTransition.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!overlayRef.current) return;

    // Function to show overlay
    const showOverlay = () => {
      gsap.set(overlayRef.current, { 
        opacity: 1, 
        display: 'block' 
      });
    };

    // Function to hide overlay
    const hideOverlay = () => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(overlayRef.current, { display: 'none' });
        },
      });
    };

    // Skip on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      gsap.set(overlayRef.current, { opacity: 0, display: 'none' });
      return;
    }

    // Show overlay immediately
    showOverlay();

    // Hide overlay after a short delay
    const timer = setTimeout(() => {
      hideOverlay();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="page-transition-overlay fixed inset-0 z-[9999] bg-[#222222]"
      style={{ 
        opacity: 0, 
        display: 'none',
        pointerEvents: 'none',
      }}
    />
  );
}