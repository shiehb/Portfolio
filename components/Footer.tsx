// components/Footer.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const footerLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "PROJECT", href: "/project" },
  { label: "CONTACT", href: "/contact" },
];

const contactLinks = [
  { label: "jerichourbano.01.01.04@gmail.com", href: "mailto:jerichourbano.01.01.04@gmail.com" },
  { label: "+63 956 698 6556", href: "tel:+639566986556" },
];

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full min-h-screen text-white font-display flex flex-col" style={{ backgroundColor: '#222222' }}>
      {/* Main Content - Top */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-20 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
            {/* Column 1: Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <h3 className="text-sm font-medium tracking-wider text-white/80 mb-3">
                Don't miss out on future updates.
              </h3>
              <div className="flex flex-col gap-3 max-w-xs">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#fd551d]/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#fd551d]/50 transition-colors"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <button 
                  className="px-6 py-2.5 text-white text-sm font-medium rounded-md transition-colors"
                  style={{ backgroundColor: '#fd551d' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e44a18'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fd551d'}
                >
                  SUBSCRIBE
                </button>
                <span className="text-xs text-white/40">Unsubscribe anytime.</span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium tracking-wider" style={{ color: '#fd551d' }}>
                  - ACCEPTING PROJECTS. JOIN THE WAITLIST.
                </p>
                <p className="text-xs font-medium tracking-wider" style={{ color: '#fd551d' }}>
                  - ONLY 3 SPOTS LEFT
                </p>
              </div>
            </motion.div>

            {/* Column 2: Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.06, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <div className="flex flex-col">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#fd551d] transition-colors py-1.5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Column 3: Contact */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <div className="flex flex-col">
                {contactLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#fd551d] transition-colors py-1.5 break-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Copyright - Center */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.18, ease: [0.33, 1, 0.68, 1] }}
        className="w-full px-4 sm:px-6 lg:px-8 py-4 md:min-h-[100px] max-h-auto flex justify-center items-center"
      >
        <div className="text-center">
          <p className="text-xs text-white/40">
            @ {currentYear} Jericho Urbano.
          </p>
          <p className="text-xs text-white/40">
            All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* Logo - Bottom Center - Fixed at bottom of footer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.24, ease: [0.33, 1, 0.68, 1] }}
        className="w-full flex justify-center overflow-hidden mt-auto"
      >
        <div className="w-full">
          <span className="block font-bold tracking-tight text-center whitespace-nowrap text-[clamp(2.5rem,12vw,18rem)] text-black">
            @echo_ng
          </span>
        </div>
      </motion.div>
    </footer>
  );
}