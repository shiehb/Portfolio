// components/SmoothScrollWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically import SmoothScroll with ssr: false
const SmoothScroll = dynamic(
    () => import('@/components/SmoothScroll'),
    { ssr: false }
);

export default function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
    return <SmoothScroll>{children}</SmoothScroll>;
}