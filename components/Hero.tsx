// components/Hero.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/lib/LoadingContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FluidCursor from "@/components/FluidCursor";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import PaperShader from "@/components/PaperShader";

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
      className={`flex items-center py-2 shrink-0 ${reverse ? "marquee-text-dark" : "marquee-text-light"
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

const CROP_SCALE = 0.78;

export function get3x2TargetDimensions() {
  if (typeof window === "undefined") {
    return {
      targetWidth: Math.round(900 * CROP_SCALE),
      targetHeight: Math.round(600 * CROP_SCALE),
      borderRadius: "24px",
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 768;

  let targetWidth: number;
  let targetHeight: number;
  let borderRadius = "24px";

  if (isMobile) {
    targetWidth = Math.min(vw * 0.76, (vh * 0.46) / 1.25, 290);
    targetHeight = targetWidth * 1.28;
    borderRadius = "16px";
  } else {
    if (vw < 1024) {
      targetWidth = Math.min(vw * 0.75, vh * 0.65 * 1.5, 620);
      borderRadius = "20px";
    } else if (vw < 1280) {
      targetWidth = Math.min(vw * 0.45, vh * 0.6 * 1.5, 600);
      borderRadius = "24px";
    } else if (vw < 2560) {
      targetWidth = Math.min(vw * 0.38, vh * 0.6 * 1.5, 700);
      borderRadius = "24px";
    } else {
      targetWidth = Math.min(vw * 0.35, vh * 0.65 * 1.5, 900);
      borderRadius = "28px";
    }
    targetHeight = targetWidth / 1.5;
  }

  targetWidth = Math.round(targetWidth * CROP_SCALE);
  targetHeight = Math.round(targetHeight * CROP_SCALE);

  return { targetWidth, targetHeight, borderRadius };
}

export default function Hero() {
  const { incrementLoaded } = useLoading();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fluidCursorRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (frameRef.current) {
      gsap.set(frameRef.current, { opacity: 0 });
    }
    if (fluidCursorRef.current) {
      gsap.set(fluidCursorRef.current, { opacity: 0 });
    }
    if (portraitRef.current) {
      gsap.set(portraitRef.current, { opacity: 0, scale: 1.1 });
    }
    if (marqueeRef.current) {
      gsap.set(marqueeRef.current, { opacity: 0 });
    }
    if (signatureContainerRef.current) {
      gsap.set(signatureContainerRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 20,
        visibility: "hidden",
      });
    }
    if (aboutTitleRef.current) {
      gsap.set(aboutTitleRef.current, { opacity: 0, y: 30, scale: 0.9 });
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        isFirstRender.current = false;
      },
    });

    tl.to(
      frameRef.current,
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      0.1
    );

    tl.to(
      portraitRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      0.2
    );

    if (fluidCursorRef.current) {
      tl.to(
        fluidCursorRef.current,
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        0.2
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current || !frameRef.current) return;

    const ctx = gsap.context(() => {
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

      if (portraitRef.current) {
        gsap.set(portraitRef.current, {
          scale: 1.0,
          filter: "grayscale(0%)",
          x: "0%",
          y: "0%",
        });
      }

      if (marqueeRef.current) {
        gsap.set(marqueeRef.current, { opacity: 0 });
      }

      if (fluidCursorRef.current) {
        gsap.set(fluidCursorRef.current, { opacity: 1 });
      }

      if (aboutTitleRef.current) {
        gsap.set(aboutTitleRef.current, {
          opacity: 0,
          y: 30,
          scale: 0.9,
        });
      }

      signaturePathsRef.current.forEach((path) => {
        if (path) {
          const length = path.getTotalLength ? path.getTotalLength() : 1200;
          const padded = length + 4;
          gsap.set(path, {
            strokeDasharray: `${length} ${padded}`,
            strokeDashoffset: padded,
            opacity: 0,
          });
        }
      });

      if (signatureContainerRef.current) {
        gsap.set(signatureContainerRef.current, {
          opacity: 0,
          scale: 0.85,
          y: 20,
          visibility: "hidden",
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

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

      if (fluidCursorRef.current) {
        tl.to(
          fluidCursorRef.current,
          {
            opacity: 0,          // Fully hides the fluid cursor
            duration: 0.5,       // Fades out continuously until 50% into the zoom-out scroll
            ease: "power1.out",
          },
          0
        );
      }

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

      if (signatureContainerRef.current) {
        tl.to(
          signatureContainerRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            visibility: "visible",
            ease: "power2.out",
            duration: 0.3,
          },
          0.35
        );

        const strokeSequence = [
          { duration: 0.32, ease: "power1.inOut" },
          { duration: 0.3, ease: "power1.inOut" },
          { duration: 0.12, ease: "power2.out" },
          { duration: 0.1, ease: "expo.out" },
          { duration: 0.13, ease: "power2.out" },
          { duration: 0.05, ease: "back.out(3)" },
        ];

        let strokeCursor = 0.38;
        signaturePathsRef.current.forEach((path, idx) => {
          if (!path) return;
          const { duration, ease } = strokeSequence[idx] ?? {
            duration: 0.15,
            ease: "power1.inOut",
          };

          tl.set(path, { opacity: 1 }, strokeCursor);

          tl.to(
            path,
            {
              strokeDashoffset: 0,
              ease,
              duration,
            },
            strokeCursor
          );

          strokeCursor += duration;
        });
      }

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
          className="relative z-10 flex justify-center items-center overflow-hidden bg-white text-zinc-900 will-change-[width,height,border-radius,background-color,opacity]"
          style={{
            margin: "auto",
            position: "relative",
            width: "100%",
            height: "100%",
            opacity: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <div
            ref={portraitRef}
            className="absolute inset-0 z-10 pointer-events-none will-change-[transform,filter,opacity]"
            style={{
              opacity: 0,
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <PaperShader
                colorBack="#ffffff"
                className="absolute inset-0 z-0 pointer-events-none w-full h-full"
              />
              <div
                ref={fluidCursorRef}
                className="absolute inset-0 z-[5] pointer-events-none will-change-[opacity]"
                style={{ opacity: 0 }}
              >
                <FluidCursor
                  className="w-full h-full"
                  color={[0.08, 0.08, 0.09]}
                  maxOpacity={0.85}
                  densityDissipation={1.1}
                  velocityDissipation={1.4}
                  pressure={0.15}
                  curl={25}
                  splatRadius={0.28}
                  splatForce={5000}
                />
              </div>
              <Hero3DCanvas
                diffuseMapUrl="/img/hero.webp"
                depthMapUrl="/img/hero-depth.webp"
                intensity={0.007} // Minimal subtle movement (0.004 = ultra subtle, 0.007 = balanced luxury, 0.012 = pronounced)
                focusPlane={0.65} // Anchors face & eyes as center pivot
                smoothing={0.045} // Smooth mouse lerp dampening
                maxDisplacement={0.012} // Prevents silhouette edge tearing
                onLoaded={() => setImageLoaded(true)}
                className="w-full h-full relative z-10"
              />
            </div>
          </div>
        </section>

        <div
          ref={signatureContainerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center px-2 w-[75%] md:w-[55%]"
          style={{
            opacity: 0,
            visibility: "hidden",
          }}
        >
          <svg
            viewBox="50 0 520 532"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-[0_10px_30px_rgba(253,85,29,0.45)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            <path
              ref={(el) => {
                signaturePathsRef.current[0] = el;
              }}
              d="M233.6,264q-68.7,120.4-103,131.7C96.3,407,63.6,422.8,93,363.2s128.399999-216.300002,151.999999-237.200002s61.9-36.699999,49.7,16.100001-76.2,191.9-92.2,223.9q-16,32-16,32-26.4,54-23.5,58t13.9-4.4"
              stroke="#fd551d"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                signaturePathsRef.current[1] = el;
              }}
              d="M270,269.6q11.5,3.2,30-8.4c18.5-11.6,35.7-41.5,23.5-25.2s-20.000001,24.399999-.000001,14.699999q20-9.7,34.599999-23.600001l-10.8,18.9l27-20.5l3.4,15.5q34.3-20.5,49.8-50.3c15.5-29.8,24.2-55.9,19-64.7s-22.4-10-31-2.3-35.6,34.999999-43.6,51.999999-12.6,39.499999-3.4,43.299999s25.8-2.700001,34.5-14.000001q8.7-11.3,8.7-11.3l18.7-32.2"
              stroke="#fd551d"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                signaturePathsRef.current[2] = el;
              }}
              d="M399.2,156.1Q387,173.1,387,181c0,7.9,7.3,13.8,16,7.7q8.7-6.1,19.4-16.9"
              stroke="#fd551d"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                signaturePathsRef.current[3] = el;
              }}
              d="M388.5,207.5l-16.6,4.4"
              stroke="#fd551d"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                signaturePathsRef.current[4] = el;
              }}
              d="M300,234.1q-21.9-4-1.7-10.7t206.226236-63.6"
              stroke="#fd551d"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                signaturePathsRef.current[5] = el;
              }}
              d="M554.172373,149l6.967879-2.1"
              stroke="#fd551d"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          ref={aboutTitleRef}
          className="absolute bottom-10 sm:bottom-12 md:bottom-16 lg:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
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