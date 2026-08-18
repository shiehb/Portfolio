// components/Footer.tsx (Closer to Reference Image)
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 text-white font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Location */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#c0c0c0] mb-3 font-medium">
              LOCATION
            </h4>
            <div className="space-y-1">
              <p className="text-xs text-white">Vadodara</p>
              <p className="text-xs text-[#c0c0c0]">Gujarat.390020</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#c0c0c0] mb-3 font-medium">
              CONTACT
            </h4>
            <div className="space-y-1">
              <a 
                href="tel:+919825916417" 
                className="text-xs text-white hover:text-[#fd551d] transition-colors block"
              >
                +91 98259 16417
              </a>
              <a 
                href="mailto:onethirddesigner@gmail.com" 
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                onethirddesigner@gmail.com
              </a>
            </div>
          </div>

          {/* Follow */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#c0c0c0] mb-3 font-medium">
              FOLLOW
            </h4>
            <div className="space-y-1">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                Instagram
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                LinkedIn
              </a>
              <a 
                href="https://dribbble.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                Dribbble
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                X (Twitter)
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#c0c0c0] mb-3 font-medium">
              NAVIGATION
            </h4>
            <div className="space-y-1">
              <Link 
                href="/" 
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                About
              </Link>
              <Link 
                href="/projects" 
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                Projects
              </Link>
              <Link 
                href="/contact" 
                className="text-xs text-[#c0c0c0] hover:text-white transition-colors block"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-[#c0c0c0]">
            &copy; {currentYear} Jericho Urbano. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="text-[10px] uppercase tracking-[0.15em] text-[#c0c0c0] hover:text-white transition-colors flex items-center gap-2"
          >
            Back To Top
            <svg 
              className="w-3 h-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 15l7-7 7 7" 
              />
            </svg>
          </button>
        </div>

        {/* Love Note */}
        <div className="mt-4 text-center">
          <p className="text-[9px] text-zinc-700 tracking-[0.05em]">
            Designed with <span className="text-[#fd551d]">❤</span> & care
          </p>
        </div>
      </div>
    </footer>
  );
}