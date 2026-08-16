'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const marqueeItems = [
  "Freelance Web Developer",
  "Videographer",
  "Photographer",
];

const PIXELS_PER_SECOND = 60;

function MarqueeWords({ reverse }: { reverse: boolean }) {
  return (
    <div className={`flex items-center py-2 shrink-0 ${reverse ? "marquee-text-dark" : "marquee-text-light"}`}>
      {/* Duplicated items to ensure full width coverage */}
      {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
        <span key={index} className="marquee-text shrink-0 px-4">
          {item}
        </span>
      ))}
    </div>
  );
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => setDistance(el.scrollWidth);
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    document.fonts?.ready.then(measure);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || distance <= 0) return;

    let frame: number;
    let startTime: number | null = null;

    const tick = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsedSeconds = (time - startTime) / 1000;
      const traveled = (elapsedSeconds * PIXELS_PER_SECOND) % distance;
      const offset = reverse ? -distance + traveled : -traveled;

      container.style.transform = `translateX(${offset}px)`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [distance, reverse]);

  return (
    <div className="relative overflow-hidden whitespace-nowrap w-full">
      <div ref={containerRef} className="flex will-change-transform">
        <div ref={trackRef} className="flex shrink-0">
          <MarqueeWords reverse={reverse} />
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          <MarqueeWords reverse={reverse} />
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          <MarqueeWords reverse={reverse} />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen flex justify-center items-end overflow-hidden"
      style={{ height: '100svh' }}
      id="home"
      aria-label="Hero section"
    >
      {/* Marquee text container */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0 flex flex-col pointer-events-none"
        aria-hidden="true"
      >
        {/* Top marquee - scrolls left */}
        <MarqueeRow />

        {/* Bottom marquee - scrolls right */}
        <MarqueeRow reverse />
      </div>

      {/* Hero image container */}
      <div 
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full z-10 flex justify-center items-end overflow-hidden"
        style={{ maxWidth: '650px' }}
      >
        <Image
          src="/img/hero.png"
          alt="Jericho Urbano portrait"
          fill
          priority
          sizes="(max-width: 650px) 100vw, 650px"
          className="object-cover object-bottom"
        />
      </div>
    </section>
  );
}