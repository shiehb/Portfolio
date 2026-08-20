// app/page.tsx
'use client';

import Hero from "../components/Hero";
import About from "../components/About";
import HorizontalScroll from "../components/HorizontalScroll";
import Projects from "../components/Projects";
import SmoothScrollWrapper from "@/components/SmoothScrollWrapper";
import SectionVignette from "@/components/SectionVignette";

export default function Home() {
  return (
    <SmoothScrollWrapper>
      <main className="min-h-screen text-white relative">
        <div className="relative z-10">
          <Hero />
          <About />
          <HorizontalScroll />
          <Projects />
        </div>
        {/* Vignette fader at the bottom before footer */}
        <SectionVignette />
      </main>
    </SmoothScrollWrapper>
  );
}