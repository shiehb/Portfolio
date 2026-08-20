// components/Footer.tsx
'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Copy, Check, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { triggerPageTransition } from '@/lib/transitionEvents';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const router = useRouter();
  const pathname = usePathname();
  const [currentYear] = useState(() => new Date().getFullYear());
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  const footerRef = useRef<HTMLElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    triggerPageTransition(() => {
      router.push(href);
    }, href);
  };

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

  // Safe animation with guaranteed visibility fallback
  useEffect(() => {
    const columns = [col1Ref.current, col2Ref.current, col3Ref.current, socialRef.current].filter(Boolean);
    
    // Ensure all elements are visible immediately in case animation fails or is skipped
    columns.forEach(col => {
      if (col) {
        col.style.opacity = "1";
        col.style.transform = "none";
      }
    });

    const ctx = gsap.context(() => {
      if (footerRef.current) {
        gsap.fromTo(
          columns,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    }, footerRef);

    // Refresh triggers when route changes
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [pathname]);

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
    <footer
      ref={footerRef}
      className="w-full min-h-[500px] md:min-h-screen text-white font-display flex flex-col justify-between bg-[#222222] relative z-10"
    >
      {/* Main Content - Top */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10 md:pb-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full">
            {/* Column 1: Navigation */}
            <div ref={col1Ref} className="md:col-span-1 opacity-100">
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/90 mb-4 font-semibold">
                Navigation
              </span>
              <div className="flex flex-col items-start gap-2.5">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleFooterLinkClick(e, link.href)}
                    className="group inline-flex items-center gap-1.5 text-sm sm:text-base text-white/90 hover:text-[#fd551d] transition-colors py-1 w-fit font-medium"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-[#fd551d]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Contact */}
            <div ref={col2Ref} className="md:col-span-1 opacity-100">
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/90 mb-4 font-semibold">
                Contact
              </span>
              <div className="flex flex-col items-start gap-4">
                {/* Email with Quick Copy */}
                <div className="flex flex-col items-start gap-1 w-full max-w-sm">
                  <span className="text-xs text-white/70 uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-sm sm:text-base text-white hover:text-[#fd551d] transition-colors break-all font-medium"
                    >
                      {EMAIL}
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      type="button"
                      aria-label="Copy Email"
                      className="relative p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer inline-flex items-center justify-center border border-white/20"
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
                  <span className="text-xs text-white/70 uppercase tracking-wider">Phone</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${PHONE.replace(/\s+/g, '')}`}
                      className="text-sm sm:text-base text-white hover:text-[#fd551d] transition-colors font-medium"
                    >
                      {PHONE}
                    </a>
                    <button
                      onClick={handleCopyPhone}
                      type="button"
                      aria-label="Copy Phone"
                      className="relative p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer inline-flex items-center justify-center border border-white/20"
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
            </div>

            {/* Column 3: Location & Time Zone */}
            <div ref={col3Ref} className="md:col-span-1 opacity-100">
              <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/90 mb-4 font-semibold">
                Location & Timezone
              </span>
              <div className="flex flex-col items-start gap-4">
                {/* Location */}
                <div className="flex items-start gap-2.5 text-white">
                  <MapPin className="w-4 h-4 text-[#fd551d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-white">Philippines</p>
                    <p className="text-xs text-white/70">Available Worldwide (Remote)</p>
                  </div>
                </div>

                {/* Live Time */}
                <div className="flex items-start gap-2.5 text-white">
                  <Clock className="w-4 h-4 text-[#fd551d] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-mono font-medium text-white">
                      {currentTime || "GMT+8 (PHT)"}
                    </p>
                    <p className="text-xs text-white/70">Philippine Standard Time (GMT+8)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Socials and Copyright - Center */}
      <div ref={socialRef} className="w-full px-4 sm:px-6 lg:px-8 py-6 flex justify-center items-center opacity-100">
        <div className="text-center space-y-4">
          {/* Social Links */}
          <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-white hover:text-[#fd551d] transition-colors uppercase tracking-wider font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/20 mx-auto" />

          {/* Copyright */}
          <div>
            <p className="text-xs text-white font-medium">
              © {currentYear} Jericho Urbano. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Logo - Bottom Center with subtle watermark branding */}
      <div
        aria-hidden="true"
        role="presentation"
        className="w-full flex justify-center overflow-hidden pointer-events-none select-none"
      >
        <svg
          viewBox="0 0 1000 140"
          className="w-full max-h-[140px] fill-[#fd551d]"
          role="presentation"
          aria-hidden="true"
        >
          <text
            x="50%"
            y="65%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="120"
            fontWeight="900"
            fontFamily="var(--font-display)"
            letterSpacing="-0.02em"
          >
            @echo_.ng
          </text>
        </svg>
      </div>
    </footer>
  );
}