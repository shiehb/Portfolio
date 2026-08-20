// components/Hero.tsx
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLoading } from "@/lib/LoadingContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory("manual");
}

const marqueeItems = [
  "Freelance Web Developer",
  "Videographer",
  "Photographer",
];

const PIXELS_PER_SECOND = 60;

function MarqueeWords({ reverse }: { reverse: boolean }) {
  return (
    <div
      className={`flex items-center py-2 shrink-0 ${
        reverse ? "marquee-text-dark" : "marquee-text-light"
      }`}
    >
      {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
        <span key={index} className="marquee-text shrink-0 px-6 select-none">
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
    <div className="relative overflow-hidden whitespace-nowrap w-full pointer-events-none">
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

export function get3x2TargetDimensions() {
  if (typeof window === "undefined") {
    return { targetWidth: 900, targetHeight: 600, borderRadius: "24px" };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 768;

  let targetWidth: number;
  let targetHeight: number;
  let borderRadius = "24px";

  if (isMobile) {
    targetWidth = Math.min(vw * 0.76, (vh * 0.46) / 1.25, 290);
    targetHeight = Math.round(targetWidth * 1.28);
    targetWidth = Math.round(targetWidth);
    borderRadius = "16px";
  } else {
    if (vw < 1024) {
      targetWidth = Math.min(vw * 0.75, (vh * 0.65) * 1.5, 620);
      borderRadius = "20px";
    } else if (vw < 1280) {
      targetWidth = Math.min(vw * 0.60, (vh * 0.70) * 1.5, 780);
      borderRadius = "24px";
    } else if (vw < 2560) {
      targetWidth = Math.min(vw * 0.52, (vh * 0.72) * 1.5, 960);
      borderRadius = "24px";
    } else {
      targetWidth = Math.min(vw * 0.45, (vh * 0.75) * 1.5, 1440);
      borderRadius = "28px";
    }
    targetHeight = Math.round(targetWidth / 1.5);
    targetWidth = Math.round(targetWidth);
  }

  return { targetWidth, targetHeight, borderRadius };
}

export default function Hero() {
  const { incrementLoaded } = useLoading();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const aboutTitleRef = useRef<HTMLDivElement>(null);
  const signaturePathsRef = useRef<(SVGPathElement | null)[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasIncremented = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (imageLoaded && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementLoaded();
    }
  }, [imageLoaded, incrementLoaded]);

  // Initial entrance animation to prevent flash
  useEffect(() => {
    // Set initial hidden states for all elements
    if (frameRef.current) {
      gsap.set(frameRef.current, { opacity: 0 });
    }
    if (portraitRef.current) {
      gsap.set(portraitRef.current, { opacity: 0, scale: 1.1 });
    }
    if (marqueeRef.current) {
      gsap.set(marqueeRef.current, { opacity: 0 });
    }
    // Signature starts completely hidden - will be shown by scroll animation
    if (signatureContainerRef.current) {
      gsap.set(signatureContainerRef.current, { 
        opacity: 0, 
        scale: 0.85,
        y: 20,
        visibility: 'hidden' // Ensure it's completely hidden
      });
    }
    // ABOUT title starts hidden
    if (aboutTitleRef.current) {
      gsap.set(aboutTitleRef.current, { opacity: 0, y: 30, scale: 0.9 });
    }

    // Entrance animation timeline - ONLY for elements that should be visible initially
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        isFirstRender.current = false;
      }
    });

    // 1. Frame fades in
    tl.to(frameRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, 0.1);

    // 2. Portrait fades in with slight scale
    tl.to(portraitRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
    }, 0.2);

    // NOTE: Marquee and Signature are NOT animated here - they are animated by scroll

    // Cleanup
    return () => {
      tl.kill();
    };
  }, []);

  // Main scroll animation
  useEffect(() => {
    if (!scrollContainerRef.current || !frameRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state for the frame
      gsap.set(frameRef.current, {
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        borderRadius: "0px",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        transformOrigin: "center center",
        position: "relative",
        margin: "0 auto",
        left: "0",
        top: "0",
      });

      // Initial state for portrait
      if (portraitRef.current) {
        gsap.set(portraitRef.current, {
          scale: 1.0,
          filter: "grayscale(0%)",
          x: "0%",
          y: "0%",
        });
      }

      // Initial state for marquee - hidden until scroll
      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { opacity: 0 });
      }

      // Initial state for ABOUT title - hidden until end of scroll
      if (aboutTitleRef.current) {
        gsap.set(aboutTitleRef.current, {
          opacity: 0,
          y: 30,
          scale: 0.9,
        });
      }

      // Initial state for signature paths - hidden until scroll
      signaturePathsRef.current.forEach((path) => {
        if (path) {
          const length = path.getTotalLength ? path.getTotalLength() : 1200;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
        }
      });

      // Initial state for signature container - completely hidden
      if (signatureContainerRef.current) {
        gsap.set(signatureContainerRef.current, {
          opacity: 0,
          scale: 0.85,
          y: 20,
          visibility: 'hidden',
        });
      }

      // Main timeline with scroll trigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // 1. Frame zoom out animation
      tl.to(
        frameRef.current,
        {
          width: () => `${get3x2TargetDimensions().targetWidth}px`,
          height: () => `${get3x2TargetDimensions().targetHeight}px`,
          y: () => (window.innerWidth < 768 ? "-54px" : "0px"),
          borderRadius: () => get3x2TargetDimensions().borderRadius,
          backgroundColor: "#c0c0c0",
          boxShadow:
            "0 30px 80px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          ease: "power1.out",
        },
        0
      );

      // 2. Portrait scale and grayscale
      if (portraitRef.current) {
        tl.to(
          portraitRef.current,
          {
            scale: () => (window.innerWidth < 640 ? 1.15 : 1.35),
            filter: "grayscale(100%)",
            ease: "power1.out",
          },
          0
        );
      }

      // 3. Marquee in background - fades in only as user begins scrolling / zooming out
      if (marqueeRef.current) {
        tl.to(
          marqueeRef.current,
          {
            opacity: 1,
            ease: "power1.out",
            duration: 0.25,
          },
          0.08
        );
      }

      // 4. Signature animation - appears and draws stroke during scroll
      if (signatureContainerRef.current) {
        // First make signature visible with fade and scale
        tl.to(signatureContainerRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          visibility: 'visible',
          ease: "power2.out",
          duration: 0.3,
        }, 0.35);

        // Draw each path stroke
        signaturePathsRef.current.forEach((path, idx) => {
          if (path) {
            const startOffset = 0.38 + idx * 0.04;
            tl.to(
              path,
              {
                strokeDashoffset: 0,
                ease: "power1.inOut",
                duration: 0.24,
              },
              startOffset
            );
          }
        });
      }

      // 5. ABOUT title appears ONLY at 100% zoomout (end of scroll)
      if (aboutTitleRef.current) {
        tl.fromTo(
          aboutTitleRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            duration: 0.3,
          },
          0.95
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
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
        {/* Marquee Background in the back - On mobile, positioned below hero crop and above ABOUT title */}
        <div
          ref={marqueeRef}
          className="absolute inset-x-0 bottom-24 sm:bottom-28 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-0 flex flex-col pointer-events-none will-change-[transform,opacity] select-none"
          aria-hidden="true"
          style={{ opacity: 0 }}
        >
          <MarqueeRow />
          <MarqueeRow reverse />
        </div>

        <section
          ref={frameRef}
          id="hero-zoom-frame"
          className="relative z-10 flex justify-center items-center overflow-hidden text-zinc-900 will-change-[width,height,border-radius,background-color,opacity]"
          style={{
            margin: "auto",
            position: "relative",
            width: "100%",
            height: "100%",
            opacity: 0,
          }}
        >
          {/* Portrait Image */}
          <div
            ref={portraitRef}
            className="absolute inset-0 z-10 pointer-events-none will-change-[transform,filter,opacity]"
            style={{ opacity: 0 }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/img/hero.webp"
                alt="Jericho Urbano - Visual Artist and Web Developer"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 1200px"
                quality={85}
                className="object-cover object-center select-none pointer-events-none"
                draggable={false}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>

          {/* Signature - Centered */}
          <div
            ref={signatureContainerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center w-[88%] max-w-[340px] sm:max-w-[440px] md:max-w-[540px] px-2"
            style={{ 
              opacity: 0,
              visibility: 'hidden' 
            }}
          >
            <svg
              viewBox="0 0 1000 950"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_10px_30px_rgba(253,85,29,0.45)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            >
              {/* 1. Main Iconic Elongated Left Loop */}
              <path
                ref={(el) => {
                  signaturePathsRef.current[0] = el;
                }}
                d="M 390 490 C 330 630, 220 760, 150 760 C 110 760, 125 680, 175 560 C 265 310, 395 185, 475 185 C 510 185, 505 245, 460 370 C 395 550, 305 735, 270 855 C 310 750, 355 625, 395 490"
                stroke="#fd551d"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Cursive baseline scribble */}
              <path
                ref={(el) => {
                  signaturePathsRef.current[1] = el;
                }}
                d="M 450 515 C 475 510, 485 480, 505 480 C 520 480, 530 525, 550 500 C 565 480, 575 480, 595 515 C 610 535, 630 490, 645 515"
                stroke="#fd551d"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Top-Right Monogram Flourish Loop */}
              <path
                ref={(el) => {
                  signaturePathsRef.current[2] = el;
                }}
                d="M 610 380 C 590 310, 630 215, 690 215 C 750 215, 755 315, 695 400 C 645 460, 595 435, 605 370 C 615 300, 670 270, 675 350 C 680 410, 635 445, 620 445"
                stroke="#fd551d"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 4. Sharp Dynamic Horizontal Piercing Slash */}
              <path
                ref={(el) => {
                  signaturePathsRef.current[3] = el;
                }}
                d="M 480 435 L 860 290"
                stroke="#fd551d"
                strokeWidth="17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 5. Far-Right Accent Dot */}
              <path
                ref={(el) => {
                  signaturePathsRef.current[4] = el;
                }}
                d="M 945 258 C 945 250, 955 250, 955 258 C 955 266, 945 266, 945 258 Z"
                stroke="#fd551d"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        {/* ABOUT Title - Outside the frame, at the bottom - ONLY appears at end of scroll */}
        <div
          ref={aboutTitleRef}
          className="absolute bottom-3 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <span className="font-display text-base sm:text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.3em] text-white font-bold">
            ABOUT
          </span>
        </div>
      </div>
    </div>
  );
}