import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The requested page could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 font-display">
      <p className="text-sm uppercase tracking-[0.25em] text-[#fd551d] mb-3">
        Error 404
      </p>
      <h1 className="text-4xl sm:text-6xl font-normal text-white uppercase tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-zinc-400 max-w-md text-sm sm:text-base mb-8">
        The project, page, or resource you are looking for has been moved, removed, or never existed.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#fd551d] text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#e04815] shadow-lg shadow-[#fd551d]/30"
        >
          Return Home
        </Link>
        <Link
          href="/projects"
          className="px-6 py-2.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs uppercase tracking-wider transition-all hover:text-white hover:bg-zinc-700"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}
