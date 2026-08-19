// components/About.tsx
'use client';

import { useRef, useEffect } from "react";
import { useLoading } from "@/lib/LoadingContext";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

function AnimatedLetter({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const charProgress = index / total;
  const start = charProgress - 0.1;
  const end = charProgress + 0.05;

  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

function AnimatedParagraph({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = text.split("");

  return (
    <p ref={ref} className={className}>
      {chars.map((char, index) => (
        <AnimatedLetter
          key={index}
          char={char}
          index={index}
          total={chars.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
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
  const words: { text: string; className?: string }[] = [];
  segments.forEach((segment) => {
    segment.text.split(" ").forEach((word) => {
      words.push({ text: word, className: segment.className });
    });
  });

  return (
    <h2 className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.08,
            ease: [0.33, 1, 0.68, 1],
          }}
          className={`inline-block mr-[0.25em] ${word.className ?? ""}`}
        >
          {word.text}
        </motion.span>
      ))}
    </h2>
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
                    <span className="block mb-2 md:mb-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0] font-display">
                        ABOUT
                    </span>

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
                        className="mx-auto mt-4 md:mt-10 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0] font-display"
                        text="Crafting high-impact interactive web applications, cinematic narratives, and brand identities with seamless motion physics, minimalist spatial layouts, and precision color science."
                    />
                </div>
            </div>
        </section>
    );
}