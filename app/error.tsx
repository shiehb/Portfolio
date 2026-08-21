"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Global application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 font-display">
      <p className="text-sm uppercase tracking-[0.25em] text-[#fd551d] mb-3">
        System Notice
      </p>
      <h1 className="text-3xl sm:text-5xl font-normal text-white uppercase tracking-tight mb-4">
        Something Went Wrong
      </h1>
      <p className="text-zinc-400 max-w-md text-sm sm:text-base mb-8">
        An unexpected error occurred while rendering this page or loading assets.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-[#fd551d] text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#e04815] shadow-lg shadow-[#fd551d]/30 cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs uppercase tracking-wider transition-all hover:text-white hover:bg-zinc-700"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
