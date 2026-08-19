// components/PaperShaderWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically import PaperShader with ssr: false (only works in Client Components)
const PaperShader = dynamic(
    () => import('@/components/PaperShader'),
    { ssr: false }
);

export default function PaperShaderWrapper() {
    return <PaperShader />;
}