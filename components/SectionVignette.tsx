// components/SectionVignette.tsx
'use client';

export default function SectionVignette() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="relative w-full h-[160px] sm:h-[220px] md:h-[280px] overflow-hidden pointer-events-none select-none"
    >
      {/* Vignette fade: radial darkening blending smoothly into footer bg */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 140% 100% at 50% 100%,
              #222222 0%,
              #222222 20%,
              rgba(34, 34, 34, 0.6) 50%,
              transparent 85%
            ),
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(34, 34, 34, 0.4) 40%,
              #222222 100%
            )
          `,
        }}
      />
    </div>
  );
}