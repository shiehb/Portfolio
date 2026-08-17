'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [navState, setNavState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isMenuOpen = navState === 'opening' || navState === 'open';
  const isOverlayDown = navState === 'opening' || navState === 'open' || navState === 'closing';
  const isTextVisible = navState === 'open';

  // Scrub logo and menu button invert filter (0 to 1) continuously with scroll on desktop
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      // 1. Hero Section (#home):
      ScrollTrigger.create({
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const val = Math.min(1, self.progress * 2);
          header.style.setProperty("--nav-invert", val.toFixed(3));
        },
      });

      // 2. Horizontal Scroll Section (#gallery):
      ScrollTrigger.create({
        trigger: "#gallery",
        start: "top top",
        end: () => {
          const gallery = document.querySelector("#gallery");
          const innerTrack = gallery?.querySelector(".will-change-transform");
          return innerTrack ? `+=${(innerTrack as HTMLElement).scrollWidth}` : "bottom top";
        },
        scrub: true,
        onUpdate: (self) => {
          const val = Math.max(0, Math.min(1, 1 - self.progress));
          header.style.setProperty("--nav-invert", val.toFixed(3));
        },
      });

      // 3. Projects Section (#projects):
      ScrollTrigger.create({
        trigger: "#projects",
        start: "top top",
        end: "bottom bottom",
        onUpdate: () => {
          header.style.setProperty("--nav-invert", "0");
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const handleToggle = () => {
    if (navState === 'closed') {
      setNavState('opening');
    } else if (navState === 'open' || navState === 'opening') {
      setNavState('closing');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (navState === 'opening') {
      timer = setTimeout(() => {
        setNavState('open');
      }, 450);
    } else if (navState === 'closing') {
      timer = setTimeout(() => {
        setNavState('closed');
        if (pendingHref) {
          const target = document.querySelector(pendingHref);
          target?.scrollIntoView({ behavior: 'smooth' });
          setPendingHref(null);
        }
      }, 250);
    }

    return () => clearTimeout(timer);
  }, [navState, pendingHref]);

  useEffect(() => {
    document.body.style.overflow = isOverlayDown ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOverlayDown]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setPendingHref(href);
    setNavState('closing');
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full h-[70px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center z-30 transition-all duration-500 ease-in-out sm:bg-transparent sm:backdrop-blur-none ${isOverlayDown
            ? "bg-transparent backdrop-blur-none"
            : "bg-zinc-950/80 backdrop-blur-md"
          }`}
        style={{ "--nav-invert": "0" } as React.CSSProperties}
      >
        {/* LOGO */}
        <Image
          src="/img/logo.png"
          alt="Jericho Urbano Logo"
          width={120}
          height={48}
          priority
          className="logo w-[55px] xs:w-[65px] sm:w-[80px] md:w-[95px] lg:w-[110px] h-auto object-contain max-h-[45px] transition-all duration-300 [filter:invert(1)] sm:[filter:invert(var(--nav-invert,0))]"
          style={
            isMenuOpen
              ? { filter: "invert(1)" }
              : undefined
          }
        />

        <div className="flex items-center justify-end gap-3 ml-auto">
          {/* MENU / CLOSE BUTTON */}
          <button
            type="button"
            className="menu-btn outline-none bg-transparent flex items-center justify-center w-10 h-10 text-white stroke-white border-2 border-current rounded-md p-2 sm:text-zinc-900 sm:stroke-zinc-900 transition-all duration-300 [filter:brightness(0)_invert(1)] sm:[filter:invert(var(--nav-invert,0))]"
            style={
              isMenuOpen
                ? { filter: "brightness(0) invert(1)" }
                : undefined
            }
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
            onClick={handleToggle}
          >
            {isMenuOpen ? (
              <svg
                className="w-full h-full stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="w-full h-full stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* OVERLAY MENU */}
      <nav
        className={`fixed inset-0 w-full h-screen bg-gradient-to-br from-zinc-950 to-zinc-800 text-white transform transition-transform duration-500 ease-in-out z-20 flex items-center justify-center ${isOverlayDown ? "translate-y-0" : "-translate-y-full"
          }`}
        id="nav-menu"
        aria-label="Main navigation"
      >
        <ul className="list-none flex flex-col items-center gap-8 text-center m-0 p-0 text-white">
          {navItems.map((item, index) => (
            <li
              key={item.label}
              className={`transform transition-all duration-400 ease-out ${isTextVisible
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-6 pointer-events-none"
                }`}
              style={{
                transitionDelay: isTextVisible ? `${index * 90}ms` : '0ms',
              }}
            >
              <Link
                href={item.href}
                className="nav-menu-link text-white hover:text-zinc-300 transition-colors"
                onClick={(e) => handleLinkClick(e, item.href)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}