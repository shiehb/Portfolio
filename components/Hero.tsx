'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const marqueeItems = [
  "Freelance Web Developer",
  "Videographer",
  "Photographer",
];

const PIXELS_PER_SECOND = 60;

function MarqueeWords({ reverse }: { reverse: boolean }) {
  return (
    <div className={`flex items-center py-2 shrink-0 ${reverse ? "marquee-text-dark" : "marquee-text-light"}`}>
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current || !frameRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      gsap.set(frameRef.current, {
        scale: 1,
        borderRadius: "0px",
        backgroundColor: "#ffffff",
        transformOrigin: "center center",
      });

      if (portraitRef.current) {
        gsap.set(portraitRef.current, { scale: 1.0, filter: "grayscale(0)" });
      }

      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { opacity: 1 });
      }

      // Mobile Breakpoint (< 768px): 70% scale target
      mm.add("(max-width: 767px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });

        tl.to(frameRef.current, {
          scale: 0.7,
          borderRadius: "16px",
          aspectRatio: 1.5,
          backgroundColor: "#c0c0c0",
          boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.7)",
          ease: "power1.out",
        }, 0);

        if (portraitRef.current) {
          tl.to(portraitRef.current, {
            scale: 1.2,
            filter: "grayscale(1)",
            ease: "power1.out",
          }, 0);
        }

        if (marqueeRef.current) {
          tl.to(marqueeRef.current, { opacity: 0, ease: "power1.out" }, 0);
        }
      });

      // Desktop Breakpoint (>= 768px): 30% scale target
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });

        tl.to(frameRef.current, {
          scale: 0.3,
          borderRadius: "24px",
          aspectRatio: 1.5,
          backgroundColor: "#c0c0c0",
          boxShadow: "0 30px 80px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          ease: "power1.out",
        }, 0);

        if (portraitRef.current) {
          tl.to(portraitRef.current, {
            scale: 1.35,
            filter: "grayscale(1)",
            ease: "power1.out",
          }, 0);
        }

        if (marqueeRef.current) {
          tl.to(marqueeRef.current, { opacity: 0, ease: "power1.out" }, 0);
        }
      });

    }, scrollContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full"
      style={{ height: "260vh" }}
      id="home"
      aria-label="Hero section"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
        <section
          ref={frameRef}
          className="relative w-full h-full flex justify-center items-end overflow-hidden text-zinc-900 shadow-2xl"
          style={{ willChange: "transform, border-radius, aspect-ratio, background-color" }}
        >
          {/* Marquee text container */}
          <div
            ref={marqueeRef}
            className="absolute left-0 right-0 top-1/3 -translate-y-1/2 md:top-1/2 md:-translate-y-1/2 z-0 flex flex-col pointer-events-none"
            aria-hidden="true"
          >
            <MarqueeRow />
            <MarqueeRow reverse />
          </div>

          {/* Hero Image Wrapper: Height relative to viewport screen height, width auto */}
          <div
            ref={portraitRef}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex justify-center items-end pointer-events-none h-full w-auto"
            style={{ willChange: "transform, filter" }}
          >
            <Image
              src="/img/hero.webp"
              alt="Jericho Urbano portrait"
              width={1920}
              height={1080}
              priority
              unoptimized
              quality={95}
              style={{ height: "100%", width: "auto", objectFit: "contain", objectPosition: "bottom" }}
              className="max-h-full max-w-none"
            />
          </div>
        </section>
      </div>
    </div>
  );
}