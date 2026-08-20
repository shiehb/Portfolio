// components/PaperShader.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Dithering } from "@paper-design/shaders-react";

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

export default function PaperShader() {
  const pathname = usePathname();
  const [colorBack, setColorBack] = useState("#222222");
  const lastBackRef = useRef("#222222");

  // Reset to dark theme defaults on non-home pages
  useEffect(() => {
    if (pathname !== "/") {
      const rafId = requestAnimationFrame(() => {
        setColorBack("#222222");
        lastBackRef.current = "#222222";
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [pathname]);

  useEffect(() => {
    const updateColorFromProgress = (progress: number) => {
      let factor = 0;
      if (progress <= 0.1) {
        // Staying on #222222 from 0% to 10%
        factor = 0;
      } else if (progress >= 0.9) {
        // Fully white #ffffff from 90% onwards
        factor = 1;
      } else {
        // Smoothly interpolate between 10% and 90%
        factor = (progress - 0.1) / 0.8;
      }

      const nextBack = interpolateColor("#222222", "#ffffff", factor);

      if (nextBack !== lastBackRef.current) {
        lastBackRef.current = nextBack;
        setColorBack(nextBack);
      }
    };

    const handleProgressEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (typeof customEvent.detail?.progress === "number") {
        updateColorFromProgress(customEvent.detail.progress);
      }
    };

    window.addEventListener("shader-scroll-progress", handleProgressEvent);

    return () => {
      window.removeEventListener("shader-scroll-progress", handleProgressEvent);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        background: "transparent",
      }}
      aria-hidden="true"
    >
      <Dithering
        colorBack={colorBack}
        colorFront="rgba(253, 85, 29, 0.10)"
        shape="warp"
        type="2x2"
        speed={0.3}
        size={1}
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