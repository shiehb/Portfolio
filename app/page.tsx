// app/page.tsx
'use client';

import Hero from "../components/Hero";
import About from "../components/About";
import HorizontalScroll from "../components/HorizontalScroll";
import Projects from "../components/Projects";
import SmoothScrollWrapper from "@/components/SmoothScrollWrapper";

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
      </main>
    </SmoothScrollWrapper>
  );
}
