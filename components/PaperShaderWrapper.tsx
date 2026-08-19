// components/PaperShaderWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PaperShader with ssr: false (only works in Client Components)
const PaperShader = dynamic(
    () => import('@/components/PaperShader'),
    { ssr: false }
);

export default function PaperShaderWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if ('requestIdleCallback' in window) {
            const handle = window.requestIdleCallback(() => setMounted(true), { timeout: 1500 });
            return () => window.cancelIdleCallback(handle);
        } else {
            const timer = setTimeout(() => setMounted(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!mounted) return null;
    return <PaperShader />;
}