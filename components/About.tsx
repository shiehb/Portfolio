// components/About.tsx
'use client';

import { useRef, useEffect } from "react";
import { useLoading } from "@/lib/LoadingContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Segment {
  text: string;
  className?: string;
}

function WordsPullUpMultiStyle({
  segments,
  className = "",
}: {
  segments: Segment[];
  className?: string;
}) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const words: { text: string; className?: string }[] = [];
  
  segments.forEach((segment) => {
    segment.text.split(" ").forEach((word) => {
      words.push({ text: word, className: segment.className });
    });
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const wordElements = containerRef.current?.querySelectorAll(".word-span");
      if (!wordElements) return;

      // Set initial state
      gsap.set(wordElements, {
        y: 20,
        opacity: 0,
      });

      // Animate in with stagger
      gsap.to(wordElements, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <h2 ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`word-span inline-block mr-[0.25em] ${word.className ?? ""}`}
        >
          {word.text}
        </span>
      ))}
    </h2>
  );
}

function AnimatedParagraph({ text, className = "" }: { text: string; className?: string }) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!paragraphRef.current) return;

    const ctx = gsap.context(() => {
      const words = paragraphRef.current?.querySelectorAll(".word-span");
      if (!words || words.length === 0) return;

      const totalWords = words.length;

      // Set initial opacity
      gsap.set(words, { opacity: 0.25 });

      // Animate each word based on scroll progress
      words.forEach((word, index) => {
        const wordProgress = index / totalWords;
        const start = Math.max(0, wordProgress - 0.15);
        const end = Math.min(1, wordProgress + 0.1);

        const startPercent = (85 - (start * 60)).toFixed(2);
        const endPercent = (85 - (end * 60)).toFixed(2);

        gsap.to(word, {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: paragraphRef.current,
            start: `top ${startPercent}%`,
            end: `top ${endPercent}%`,
            scrub: 1.5,
          },
        });
      });
    }, paragraphRef);

    return () => ctx.revert();
  }, []);

  const words = text.split(" ");

  return (
    <p ref={paragraphRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="word-span inline-block mr-[0.25em]"
        >
          {word}
        </span>
      ))}
    </p>
  );
}

export default function About() {
  const { incrementLoaded } = useLoading();
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      hasIncremented.current = true;
      incrementLoaded();
    }
  }, [incrementLoaded]);

  return (
    <section id="about" className="text-white font-display">
      <div className="py-12 md:py-20 flex justify-center items-center px-4">
        <div className="text-center">
          <WordsPullUpMultiStyle
            className="mx-auto max-w-3xl text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-[0.95] sm:leading-[0.9] text-[#fff] font-display"
            segments={[
              { text: "I am Jericho Urbano,", className: "font-normal" },
              { text: "a VISUAL ARTIST & WEB DEVELOPER.", className: "text-[#fd551d]" },
              {
                text: "Specializing in immersive digital experiences, videography, and narrative aesthetics.",
                className: "font-normal",
              },
            ]}
          />

          <AnimatedParagraph
            className="mx-auto mt-4 md:mt-10 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-white/90 font-display"
            text="Crafting high-impact interactive web applications, cinematic narratives, and brand identities with seamless motion physics, minimalist spatial layouts, and precision color science."
          />
        </div>
      </div>
    </section>
  );
}