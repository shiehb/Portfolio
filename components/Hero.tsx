import { useEffect, useRef, useState } from "react";
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

// Function to calculate target dimensions responsively (3:2 Portrait on mobile, 3:2 Landscape on desktop)
export function get3x2TargetDimensions() {
  if (typeof window === "undefined") {
    return { targetWidth: 900, targetHeight: 600, borderRadius: "24px" };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 640;

  let targetWidth: number;
  let targetHeight: number;
  let borderRadius = "24px";

  if (isMobile) {
    // 3:2 Portrait orientation (2:3 ratio: Height = Width * 1.5, exact 3:2 vertical)
    targetWidth = Math.min(vw * 0.82, (vh * 0.70) / 1.5, 340);
    targetHeight = Math.round(targetWidth * 1.5);
    targetWidth = Math.round(targetWidth);
    borderRadius = "20px";
  } else {
    // 3:2 Landscape orientation (3:2 ratio: Width = Height * 1.5, exact 3:2 horizontal)
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const signaturePathsRef = useRef<(SVGPathElement | null)[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current || !frameRef.current || !isMounted) return;

    const ctx = gsap.context(() => {
      // Initial state: Full screen 100vw x 100vh, 0px radius, white background
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
        gsap.set(marqueeRef.current, { opacity: 1 });
      }

      // Initial state for signature paths (prepared for drawing animation)
      signaturePathsRef.current.forEach((path) => {
        if (path) {
          const length = path.getTotalLength ? path.getTotalLength() : 1200;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
        }
      });

      if (signatureContainerRef.current) {
        gsap.set(signatureContainerRef.current, {
          opacity: 0,
          scale: 0.85,
          y: 20,
        });
      }

      // Universal timeline with dynamic function-based 3:2 target sizing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // 1. Frame dimension & style transition (Full screen -> 3:2 Portrait on mobile / 3:2 Landscape on desktop)
      tl.to(
        frameRef.current,
        {
          width: () => `${get3x2TargetDimensions().targetWidth}px`,
          height: () => `${get3x2TargetDimensions().targetHeight}px`,
          borderRadius: () => get3x2TargetDimensions().borderRadius,
          backgroundColor: "#c0c0c0",
          boxShadow:
            "0 30px 80px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          ease: "power1.out",
        },
        0
      );

      // 2. Portrait image slight scale & grayscale transition
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

      // 3. Background marquee typography fades out
      if (marqueeRef.current) {
        tl.to(
          marqueeRef.current,
          {
            opacity: 0,
            ease: "power1.out",
          },
          0
        );
      }

      // 4. Animated Signature at center appearing around 50% scroll
      if (signatureContainerRef.current) {
        // Fade in & rise container around 38% - 52%
        tl.fromTo(
          signatureContainerRef.current,
          { opacity: 0, scale: 0.85, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: "power2.out",
            duration: 0.25,
          },
          0.38
        );

        // Animate stroke writing live from 40% to 65% scroll
        signaturePathsRef.current.forEach((path, idx) => {
          if (path) {
            const startOffset = 0.40 + idx * 0.04;
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
    }, scrollContainerRef);

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full"
      style={{ height: "260vh" }}
      id="home"
      aria-label="Hero section"
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
        {/* Animated Frame: morphs smoothly from 100vw x 100vh full screen into 3:2 portrait/landscape card */}
        <section
          ref={frameRef}
          id="hero-zoom-frame"
          className="relative flex justify-center items-center overflow-hidden text-zinc-900 will-change-[width,height,border-radius,background-color]"
          style={{
            margin: "auto",
            position: "relative",
          }}
        >
          {/* Marquee text container */}
          <div
            ref={marqueeRef}
            className="absolute left-0 right-0 top-1/3 -translate-y-1/2 md:top-1/2 md:-translate-y-1/2 z-0 flex flex-col pointer-events-none will-change-[opacity]"
            aria-hidden="true"
          >
            <MarqueeRow />
            <MarqueeRow reverse />
          </div>

          {/* Hero Portrait Image - FIXED CENTERED CROP */}
          <div
            ref={portraitRef}
            className="absolute inset-0 z-10 pointer-events-none will-change-[transform,filter]"
          >
            <div className="relative w-full h-full overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#222222] animate-pulse" />
              )}
              <img
                src="/img/hero.webp"
                alt="Jericho Urbano portrait"
                className={`w-full h-full object-cover object-center select-none pointer-events-none transition-opacity duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                draggable={false}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  minWidth: "100%",
                  minHeight: "100%",
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>
          </div>

          {/* Animated Handwritten Signature from E-SIGNITURE-URBANO_JERICHO (Animates at ~50% scroll at center) */}
          <div
            ref={signatureContainerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center w-[88%] max-w-[340px] sm:max-w-[440px] md:max-w-[540px] px-2"
          >
            <svg
              viewBox="0 0 1000 950"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_10px_30px_rgba(253,85,29,0.45)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            >
              {/* 1. Main Iconic Elongated Left Loop (J/U apex loop and bottom curve) */}
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

              {/* 2. Cursive baseline scribble ("ericho" waves under crossbar) */}
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

              {/* 5. Far-Right Accent Dot (precisely aligned along the slash trajectory) */}
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
      </div>
    </div>
  );
}