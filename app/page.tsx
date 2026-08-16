import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-900" style={{ backgroundColor: '#ffffff' }}>
      <Navbar />
      <Hero />
    </main>
  );
}