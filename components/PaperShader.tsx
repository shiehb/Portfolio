// components/PaperShader.tsx
'use client';

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Dithering } from "@paper-design/shaders-react";

export interface PaperShaderProps {
  className?: string;
  style?: React.CSSProperties;
  colorBack?: string;
  colorFront?: string;
  shape?: "warp" | "wave" | "dots" | "simplex" | "ripple" | "swirl" | "sphere";
  speed?: number;
  size?: number;
  type?: "2x2" | "4x4" | "8x8" | "random";
}

const emptySubscribe = () => () => { };

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  const f = Math.min(Math.max(factor, 0), 1);
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function PaperShader({
  className = "absolute inset-0 pointer-events-none w-full h-full",
  style,
  colorBack: propColorBack,
  colorFront = "rgba(253, 85, 29, 0.10)",
  shape = "warp",
  type = "2x2",
  speed = 0.3,
  size = 1,
}: PaperShaderProps = {}) {
  const isMounted = useMounted();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const getThemeColor = () => {
    if (propColorBack) return propColorBack;
    return pathname === "/about" ? "#ffffff" : "#222222";
  };

  const [colorBack, setColorBack] = useState(getThemeColor);
  const lastBackRef = useRef(getThemeColor());
  const rafRef = useRef<number | null>(null);

  // Set theme colors based on route if propColorBack is not fixed
  useEffect(() => {
    if (propColorBack) return;

    const targetColor = pathname === "/about" ? "#ffffff" : "#222222";
    if (lastBackRef.current !== targetColor) {
      lastBackRef.current = targetColor;
      setColorBack(targetColor);
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = targetColor;
      }
      if (typeof document !== "undefined") {
        document.body.style.backgroundColor = targetColor;
      }
    }
  }, [pathname, propColorBack]);

  // Handle scroll progress transition from black (#222222) to white (#ffffff) on the home page
  useEffect(() => {
    if (propColorBack || pathname !== "/") return;

    const updateColorFromProgress = (progress: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const factor = Math.max(0, Math.min(1, progress));
        const nextBack = interpolateColor("#222222", "#ffffff", factor);

        if (containerRef.current) {
          containerRef.current.style.backgroundColor = nextBack;
        }
        if (typeof document !== "undefined") {
          document.body.style.backgroundColor = nextBack;
        }

        if (nextBack !== lastBackRef.current) {
          lastBackRef.current = nextBack;
          setColorBack(nextBack);
        }
      });
    };

    const handleProgressEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (typeof customEvent.detail?.progress === "number") {
        updateColorFromProgress(customEvent.detail.progress);
      }
    };

    window.addEventListener("shader-scroll-progress", handleProgressEvent, { passive: true });

    return () => {
      window.removeEventListener("shader-scroll-progress", handleProgressEvent);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [pathname, propColorBack]);

  if (!isMounted) return null;

  const activeColorBack = propColorBack || colorBack;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: activeColorBack,
        transition: "background-color 0.1s linear",
        ...style,
      }}
      aria-hidden="true"
    >
      <Dithering
        colorBack={activeColorBack}
        colorFront={colorFront}
        shape={shape}
        type={type}
        speed={speed}
        size={size}
        className="w-full h-full block"
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        minPixelRatio={1}
      />
    </div>
  );
}