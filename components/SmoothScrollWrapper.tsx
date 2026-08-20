// components/SmoothScrollWrapper.tsx
'use client';

import SmoothScroll from '@/components/SmoothScroll';

export default function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
    return <SmoothScroll>{children}</SmoothScroll>;
}
