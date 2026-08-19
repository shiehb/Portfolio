// components/PaperShader.tsx
'use client';

import { Dithering } from "@paper-design/shaders-react";

export default function PaperShader() {
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
        colorBack="#222222"
        colorFront="#fd551d"
        shape="warp"
        type="2x2"
        speed={0.3}
        size={1}
        className="w-full h-full block"
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.1,
          mixBlendMode: "overlay",
          background: "transparent",
        }}
        minPixelRatio={1}
      />
    </div>
  );
}