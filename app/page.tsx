// app/page.tsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import HorizontalScroll from "../components/HorizontalScroll";
import Projects from "../components/Projects";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#222222] text-white">
      <Navbar />
      <Hero />
      <About />
      <HorizontalScroll />
      <Projects />
    </main>
  );
}