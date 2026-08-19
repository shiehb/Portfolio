// components/Navbar.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const [navState, setNavState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const currentInvertVal = useRef<number>(0);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const isMenuOpen = navState === 'opening' || navState === 'open';
  const isOverlayDown = navState === 'opening' || navState === 'open' || navState === 'closing';
  const isTextVisible = navState === 'open';

  // Apply direct inversion filter: 0 = Original Black, 1 = Inverted White
  const applyInvert = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    currentInvertVal.current = clamped;

    if (logoRef.current) {
      logoRef.current.style.filter = `invert(${clamped})`;
    }
    if (menuBtnRef.current) {
      menuBtnRef.current.style.filter = `invert(${clamped})`;
    }
  }, []);

  const updateHeaderColor = useCallback(() => {
    if (isMenuOpen) {
      if (logoRef.current) logoRef.current.style.filter = "invert(1)";
      if (menuBtnRef.current) menuBtnRef.current.style.filter = "invert(1)";
      return;
    }

    if (!isHome) {
      // Subpages (/projects, /about, /contact) have dark (#222222) backgrounds -> White elements (1)
      applyInvert(1);
      return;
    }

    const headerY = 35;
    const footerEl = document.querySelector("footer");
    const projectsEl = document.querySelector("#projects");
    const galleryEl = document.querySelector("#gallery");
    const aboutEl = document.querySelector("#about");
    const homeEl = document.querySelector("#home");
    const heroFrameEl = document.querySelector("#hero-zoom-frame");

    // 1. Footer Section on Main Page (Dark #222222 bg -> White elements 1)
    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      if (rect.top <= headerY) {
        applyInvert(1);
        return;
      }
    }

    // 2. Projects Section on Main Page (White bg -> Black elements 0)
    if (projectsEl) {
      const rect = projectsEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        applyInvert(0);
        return;
      }
    }

    // 3. Gallery Section on Main Page (Starts Black 1, transitions to White 0)
    if (galleryEl) {
      const rect = galleryEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        const scrollableDist = rect.height - window.innerHeight;
        const progress = scrollableDist > 0 ? Math.max(0, Math.min(1, -rect.top / scrollableDist)) : 0;
        applyInvert(1 - progress);
        return;
      }
    }

    // 4. About Section on Main Page (Black bg -> White elements 1)
    if (aboutEl) {
      const rect = aboutEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        applyInvert(1);
        return;
      }
    }

    // 5. Hero Section on Main Page (Starts White 0, zooms into Black 1)
    if (homeEl) {
      const rect = homeEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        if (heroFrameEl) {
          const frameRect = heroFrameEl.getBoundingClientRect();
          if (frameRect.top <= headerY && frameRect.bottom >= headerY) {
            const shrinkProgress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.7)));
            applyInvert(shrinkProgress);
          } else {
            applyInvert(1);
          }
        } else {
          const shrinkProgress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.7)));
          applyInvert(shrinkProgress);
        }
        return;
      }
    }

    // Default to White elements (1) for dark background areas
    applyInvert(1);
  }, [isMenuOpen, isHome, applyInvert]);

  useEffect(() => {
    updateHeaderColor();

    const handleScroll = () => {
      updateHeaderColor();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    const onTicker = () => {
      updateHeaderColor();
    };
    gsap.ticker.add(onTicker);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      gsap.ticker.remove(onTicker);
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
    setPendingHref(href);
    setNavState('closing');
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
          router.push(pendingHref);
          setPendingHref(null);
        }
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [navState, pendingHref, router]);

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
        <Link href="/" aria-label="Go to home page" className="pointer-events-auto flex items-center">
          <div ref={logoRef} className="flex items-center">
            <Image
              src="/img/logo.png"
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
            className="menu-btn outline-none bg-transparent flex items-center justify-center w-10 h-10 text-black border-2 border-black rounded-md p-2 hover:opacity-80 cursor-pointer"
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
                className={`nav-menu-link transition-colors ${isActive(item.href)
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