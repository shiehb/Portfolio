// components/PaperShaderWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const PaperShader = dynamic(() => import('@/components/PaperShader'), {
  ssr: false,
  loading: () => null,
});

export default function PaperShaderWrapper() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        background: 'transparent',
      }}
    >
      <PaperShader />
    </div>
  );
}