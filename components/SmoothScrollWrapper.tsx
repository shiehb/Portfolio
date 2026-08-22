// components/SmoothScrollWrapper.tsx
'use client';

import SmoothScroll, { useLenis } from '@/components/SmoothScroll';

export { useLenis, SmoothScroll };

export default function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
    return <SmoothScroll>{children}</SmoothScroll>;
}

