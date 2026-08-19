// components/Footer.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Copy, Check, Clock, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CONTACT", href: "/contact" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/echong.urbano" },
  { label: "Instagram", href: "https://www.instagram.com/echo_.ng/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jericho-urbano-1a886a406/" },
  { label: "GitHub", href: "https://github.com/shiehb" },
];

const EMAIL = "jerichourbano.01.01.04@gmail.com";
const PHONE = "+63 956 698 6556";

export default function Footer() {
  const [currentYear] = useState(() => new Date().getFullYear());
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Update Philippine Standard Time (GMT+8)
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch {
        setCurrentTime("");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(PHONE.replace(/\s+/g, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <footer className="w-full min-h-screen text-white font-display flex flex-col justify-between bg-[#222222]">
      {/* Main Content - Top */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 w-full">
            {/* Column 1: Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0] mb-4">
                Navigation
              </span>
              <div className="flex flex-col items-start gap-2.5">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm sm:text-base text-zinc-300 hover:text-[#fd551d] transition-colors py-1 w-fit"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-[#fd551d]" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Column 2: Contact */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0] mb-4">
                Contact
              </span>
              <div className="flex flex-col items-start gap-4">
                {/* Email with Quick Copy */}
                <div className="flex flex-col items-start gap-1 w-full max-w-sm">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-sm sm:text-base text-zinc-300 hover:text-[#fd551d] transition-colors break-all"
                    >
                      {EMAIL}
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      type="button"
                      aria-label="Copy Email"
                      className="relative p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center border border-white/10"
                    >
                      {copiedEmail ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedEmail && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#fd551d] text-white text-[10px] font-semibold rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in duration-150">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone with Quick Copy */}
                <div className="flex flex-col items-start gap-1 w-full max-w-sm">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Phone</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${PHONE.replace(/\s+/g, '')}`}
                      className="text-sm sm:text-base text-zinc-300 hover:text-[#fd551d] transition-colors"
                    >
                      {PHONE}
                    </a>
                    <button
                      onClick={handleCopyPhone}
                      type="button"
                      aria-label="Copy Phone"
                      className="relative p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center border border-white/10"
                    >
                      {copiedPhone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedPhone && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#fd551d] text-white text-[10px] font-semibold rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in duration-150">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Column 3: Location & Time Zone */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.33, 1, 0.68, 1] }}
              className="md:col-span-1"
            >
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0] mb-4">
                Location & Timezone
              </span>
              <div className="flex flex-col items-start gap-4">
                {/* Location */}
                <div className="flex items-start gap-2.5 text-zinc-300">
                  <MapPin className="w-4 h-4 text-[#fd551d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-white">Philippines</p>
                    <p className="text-xs text-zinc-400">Available Worldwide (Remote)</p>
                  </div>
                </div>

                {/* Live Time */}
                <div className="flex items-start gap-2.5 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#fd551d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-mono font-medium text-white">
                      {currentTime || "GMT+8 (PHT)"}
                    </p>
                    <p className="text-xs text-zinc-400">Philippine Standard Time (GMT+8)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Socials and Copyright - Center */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        className="w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center"
      >
        <div className="text-center space-y-4">
          {/* Social Links */}
          <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-zinc-400 hover:text-[#fd551d] transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/10 mx-auto" />

          {/* Copyright */}
          <div>
            <p className="text-xs text-zinc-400">
              © {currentYear} Jericho Urbano. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Logo - Bottom Center with subtle watermark branding */}
      <div
        aria-hidden="true"
        className="w-full flex justify-center overflow-hidden pointer-events-none select-none"
      >
        <div className="w-full">
          <span className="block font-bold tracking-tight text-center whitespace-nowrap text-[clamp(2.5rem,12vw,18rem)] text-white/[0.03]">
            @echo_ng
          </span>
        </div>
      </div>
    </footer>
  );
}