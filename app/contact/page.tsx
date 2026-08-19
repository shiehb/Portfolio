// app/contact/page.tsx
'use client';

import { useEffect, useRef } from "react";
import { useLoading } from "@/lib/LoadingContext";
import { motion } from "framer-motion";

export default function ContactPage() {
  const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Reset loading state when component mounts
    resetLoading();

    setTotalItems(1);

    const timer = setTimeout(() => {
      if (!hasIncremented.current) {
        hasIncremented.current = true;
        incrementLoaded();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [setTotalItems, incrementLoaded, resetLoading]);

  return (
    <section className="w-full flex items-center justify-center px-4 sm:px-6 pt-20 font-display bg-[#222222]">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="text-center"
        >
          <span className="block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0]">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-white">
            Let&apos;s work<br />
            <span className="text-[#fd551d]">together</span>
          </h1>
          <p className="mx-auto mt-4 md:mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0]">
            Have a project in mind? Whether it&apos;s a website, a film, or a full brand
            identity — drop a message and I&apos;ll get back to you within 24 hours.
          </p>
        </motion.div>
      </div>
    </section>
  );
}