// app/contact/page.tsx
'use client';

import { useEffect, useRef } from "react";
import { useLoading } from "@/lib/LoadingContext";
import gsap from "gsap";

export default function ContactPage() {
  const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
  const hasIncremented = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetLoading();
    setTotalItems(1);

    if (!hasIncremented.current) {
      hasIncremented.current = true;
      incrementLoaded();
    }
  }, [setTotalItems, incrementLoaded, resetLoading]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(".animate-in");
      if (elements) {
        gsap.fromTo(elements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full flex items-center justify-center px-4 sm:px-6 pt-20 font-display bg-[#222222]">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center">
          <span className="animate-in block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0]">
            GET IN TOUCH
          </span>
          <h1 className="animate-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-white">
            Let&apos;s work<br />
            <span className="text-[#fd551d]">together</span>
          </h1>
          <p className="animate-in mx-auto mt-4 md:mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0]">
            Have a project in mind? Whether it&apos;s a website, a film, or a full brand
            identity — drop a message and I&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}