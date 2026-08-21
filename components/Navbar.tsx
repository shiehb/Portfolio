// components/Navbar.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { triggerPageTransition } from '@/lib/transitionEvents';
import { useLoading } from '@/lib/LoadingContext';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { isTransitioning } = useLoading();
  const [navState, setNavState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [isWhiteBg, setIsWhiteBg] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navLinksRef = useRef<(HTMLLIElement | null)[]>([]);
  const menuIconRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const isMenuOpen = navState === 'opening' || navState === 'open';
  const isOverlayDown = navState === 'opening' || navState === 'open' || navState === 'closing';

  const updateHeaderColor = useCallback(() => {
    if (isMenuOpen) {
      if (logoRef.current) logoRef.current.style.filter = "invert(1)";
      setIsWhiteBg(false);
      return;
    }

    const headerY = 35;
    const footerEl = document.querySelector("footer");

    // Check if scrolled into footer on ANY page (footer is dark #222222 -> white logo, dark bg)
    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      if (rect.top <= headerY) {
        if (logoRef.current) logoRef.current.style.filter = "invert(1)";
        setIsWhiteBg(false);
        return;
      }
    }

    // On the About page, the content background is white -> black logo & orange/black menu button
    if (pathname === "/about") {
      if (logoRef.current) logoRef.current.style.filter = "invert(0)";
      setIsWhiteBg(true);
      return;
    }

    if (pathname === "/projects" || pathname === "/contact") {
      if (logoRef.current) logoRef.current.style.filter = "invert(1)";
      setIsWhiteBg(false);
      return;
    }

    if (!isHome) {
      if (logoRef.current) logoRef.current.style.filter = "invert(1)";
      setIsWhiteBg(false);
      return;
    }

    const projectsEl = document.querySelector("#projects");
    const galleryEl = document.querySelector("#gallery");
    const aboutEl = document.querySelector("#about");
    const homeEl = document.querySelector("#home");
    const heroFrameEl = document.querySelector("#hero-zoom-frame");

    if (projectsEl) {
      const rect = projectsEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        if (logoRef.current) logoRef.current.style.filter = "invert(0)";
        setIsWhiteBg(true);
        return;
      }
    }

    if (galleryEl) {
      const rect = galleryEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        const scrollableDist = rect.height - window.innerHeight;
        const progress = scrollableDist > 0 ? Math.max(0, Math.min(1, -rect.top / scrollableDist)) : 0;
        const isWhite = progress > 0.5;
        if (logoRef.current) logoRef.current.style.filter = `invert(${isWhite ? 0 : 1})`;
        setIsWhiteBg(isWhite);
        return;
      }
    }

    if (aboutEl) {
      const rect = aboutEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        if (logoRef.current) logoRef.current.style.filter = "invert(1)";
        setIsWhiteBg(false);
        return;
      }
    }

    if (homeEl) {
      const rect = homeEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        if (heroFrameEl) {
          const frameRect = heroFrameEl.getBoundingClientRect();
          if (frameRect.top <= headerY && frameRect.bottom >= headerY) {
            const shrinkProgress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.7)));
            if (logoRef.current) logoRef.current.style.filter = `invert(${shrinkProgress})`;
            setIsWhiteBg(shrinkProgress < 0.5);
          } else {
            if (logoRef.current) logoRef.current.style.filter = "invert(1)";
            setIsWhiteBg(false);
          }
        } else {
          if (logoRef.current) logoRef.current.style.filter = "invert(1)";
          setIsWhiteBg(false);
        }
        return;
      }
    }

    if (logoRef.current) logoRef.current.style.filter = "invert(1)";
    setIsWhiteBg(false);
  }, [isMenuOpen, isHome, pathname]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeaderColor();
          ticking = false;
        });
        ticking = true;
      }
    };

    const rafId = window.requestAnimationFrame(() => {
      updateHeaderColor();
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateHeaderColor]);

  const handleToggle = () => {
    if (navState === 'closed') {
      setNavState('opening');
    } else if (navState === 'open' || navState === 'opening') {
      setNavState('closing');
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // If clicking same page, close menu normally and scroll top
    if (pathname === href) {
      setNavState('closing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trigger page transition immediately without sliding menu up first
    triggerPageTransition(() => {
      // Runs once transition overlay has zoomed in to fully cover the screen
      setNavState('closed');
      router.push(href);
    }, href);
  };

  // Animate menu icon when state changes
  useEffect(() => {
    if (!menuIconRef.current) return;

    const isOpen = navState === 'opening' || navState === 'open';

    // Get all lines
    const lines = menuIconRef.current.querySelectorAll('line');
    const topLine = lines[0];
    const middleLine = lines[1];
    const bottomLine = lines[2];

    if (!topLine || !middleLine || !bottomLine) return;

    if (isOpen) {
      // Transform to "X"
      gsap.to(topLine, {
        attr: { x1: 4, y1: 4, x2: 20, y2: 20 },
        duration: 0.35,
        ease: "power2.inOut",
      });
      gsap.to(middleLine, {
        opacity: 0,
        scaleX: 0,
        duration: 0.25,
        ease: "power2.inOut",
      });
      gsap.to(bottomLine, {
        attr: { x1: 4, y1: 20, x2: 20, y2: 4 },
        duration: 0.35,
        ease: "power2.inOut",
      });
    } else {
      // Transform back to hamburger
      gsap.to(topLine, {
        attr: { x1: 4, y1: 7, x2: 20, y2: 7 },
        duration: 0.35,
        ease: "power2.inOut",
      });
      gsap.to(middleLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.25,
        ease: "power2.inOut",
      });
      gsap.to(bottomLine, {
        attr: { x1: 4, y1: 17, x2: 20, y2: 17 },
        duration: 0.35,
        ease: "power2.inOut",
      });
    }
  }, [navState]);

  // Animate text when menu opens/closes
  useEffect(() => {
    if (navState === 'opening') {
      // Animate links with stagger
      navLinksRef.current.forEach((link, index) => {
        if (link) {
          gsap.set(link, {
            opacity: 0,
            y: 30,
            scale: 0.85,
            rotateX: 15,
          });

          gsap.to(link, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.55,
            delay: 0.18 + index * 0.08,
            ease: "back.out(1.4)",
          });
        }
      });
    } else if (navState === 'closing') {
      // Animate links out with reverse stagger
      const visibleLinks = navLinksRef.current.filter(link => link !== null);
      visibleLinks.forEach((link, index) => {
        if (link) {
          const reverseIndex = visibleLinks.length - 1 - index;
          gsap.to(link, {
            opacity: 0,
            y: -25,
            scale: 0.8,
            rotateX: -15,
            duration: 0.25,
            delay: reverseIndex * 0.04,
            ease: "power2.in",
          });
        }
      });
    } else if (navState === 'closed') {
      // Reset links to hidden state cleanly when closed
      navLinksRef.current.forEach((link) => {
        if (link) {
          gsap.set(link, { opacity: 0 });
        }
      });
    }
  }, [navState]);

  // Handle state transitions with timers
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (navState === 'opening') {
      timer = setTimeout(() => {
        setNavState('open');
      }, 450);
    } else if (navState === 'closing') {
      timer = setTimeout(() => {
        setNavState('closed');
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [navState]);

  useEffect(() => {
    document.body.style.overflow = isOverlayDown ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOverlayDown]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full h-[70px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center z-30 bg-transparent pointer-events-none"
      >
        <Link
          href="/"
          aria-label="Go to home page"
          className="pointer-events-auto flex items-center cursor-pointer"
          onClick={(e) => handleLinkClick(e, '/')}
        >
          <div ref={logoRef} className="flex items-center transition-[filter] duration-200">
            <Image
              src="/img/logo.webp"
              alt="Jericho Urbano Logo"
              width={120}
              height={48}
              priority
              className="logo w-[55px] xs:w-[65px] sm:w-[80px] md:w-[95px] lg:w-[110px] h-auto object-contain max-h-[45px]"
            />
          </div>
        </Link>

        <div className="flex items-center justify-end gap-3 ml-auto pointer-events-auto">
          <button
            ref={menuBtnRef}
            type="button"
            className={`menu-btn relative overflow-hidden outline-none flex items-center justify-center w-10 h-10 rounded-md p-1.5 cursor-pointer bg-transparent border-2 transition-all duration-300 group shadow-sm ${isWhiteBg && !isMenuOpen
                ? "border-black text-black"
                : "border-white text-white"
              }`}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
            onClick={handleToggle}
          >
            {/* Sliding orange background: slides down on hover, slides up when not hovering */}
            <span
              className="absolute inset-0 w-full h-full bg-[#fd551d] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none"
            />
            <div ref={menuIconRef} className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
              <svg
                className={`w-full h-full stroke-current transition-colors duration-300 ${isWhiteBg && !isMenuOpen
                    ? "text-black"
                    : "text-white group-hover:text-white"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {/* Top line - horizontal */}
                <line x1="4" y1="7" x2="20" y2="7" />
                {/* Middle line - horizontal */}
                <line x1="4" y1="12" x2="20" y2="12" />
                {/* Bottom line - horizontal */}
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </div>
          </button>
        </div>
      </header>

      <nav
        className={`fixed inset-0 w-full h-screen bg-gradient-to-br from-zinc-950 to-zinc-800 text-white transform z-20 flex items-center justify-center ${isOverlayDown ? "translate-y-0 pointer-events-auto" : "-translate-y-full pointer-events-none"
          } ${isTransitioning ? "transition-none" : "transition-transform duration-500 ease-in-out"}`}
        id="nav-menu"
        aria-label="Main navigation"
      >
        <ul className="list-none flex flex-col items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 text-center m-0 p-0 text-white">
          {navItems.map((item, index) => (
            <li
              key={item.label}
              ref={(el) => {
                navLinksRef.current[index] = el;
              }}
              className="opacity-0"
            >
              <Link
                href={item.href}
                prefetch={true}
                className={`nav-menu-link transition-colors text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black uppercase tracking-wider ${isActive(item.href)
                    ? "text-[#fd551d]"
                    : "text-white hover:text-zinc-300"
                  }`}
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