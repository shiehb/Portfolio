'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP ScrollTrigger plugin safely
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
      // Capture the current viewport ratio so the frame starts perfectly
      // edge-to-edge, then animates its aspect ratio down to 3:2.
      const initialRatio = window.innerWidth / window.innerHeight;

      // 1. Initial State (Full viewport edge-to-edge)
      gsap.set(frameRef.current, {
        scale: 1,
        borderRadius: "0px",
        aspectRatio: initialRatio,
        backgroundColor: "#ffffff",
        transformOrigin: "center center",
      });

      if (portraitRef.current) {
        gsap.set(portraitRef.current, { scale: 1.0, filter: "grayscale(0)" });
      }

      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { opacity: 1 });
      }

      // 2. Scroll-Driven Zoom-Out & Cropping Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, // Smooth inertial scrub
        },
      });

      // Frame zooms down to 0.3x, crops down to a 3:2 ratio, gains rounded
      // corners, shadow, and fades to a light gray background
      tl.to(
        frameRef.current,
        {
          scale: 0.3,
          borderRadius: "20px",
          aspectRatio: 1.5, // 3:2
          backgroundColor: "#c0c0c0",
          boxShadow: "0 30px 80px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          ease: "power1.out",
          duration: 1,
        },
        0
      );

      // Portrait zooms in from 1.0x up to 1.25x and desaturates to B&W
      if (portraitRef.current) {
        tl.to(
          portraitRef.current,
          {
            scale: 1.35,
            filter: "grayscale(1)",
            ease: "power1.out",
            duration: 1,
          },
          0
        );
      }

      // Marquee fades out completely by the time the frame reaches 30%
      if (marqueeRef.current) {
        tl.to(
          marqueeRef.current,
          {
            opacity: 0,
            ease: "power1.out",
            duration: 1,
          },
          0
        );
      }
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
      {/* Pinned Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
        {/* Morphing Hero Card */}
        <section
          ref={frameRef}
          className="relative w-full flex justify-center items-end overflow-hidden text-zinc-900 shadow-2xl"
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

          {/* Hero image container with zoom-in + grayscale on scroll */}
          <div
            ref={portraitRef}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full z-10 flex justify-center items-end overflow-hidden pointer-events-none"
            style={{ maxWidth: "650px", willChange: "transform, filter" }}
          >
            <Image
              src="/img/hero.webp"
              alt="Jericho Urbano portrait"
              fill
              priority
              unoptimized
              quality={95}
              sizes="100vw"
              className="object-cover object-bottom"
            />
          </div>
        </section>
      </div>
    </div>
  );
}