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
  const navLinksRef = useRef<(HTMLLIElement | null)[]>([]);
  const menuIconRef = useRef<HTMLDivElement>(null);
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

    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      if (rect.top <= headerY) {
        applyInvert(1);
        return;
      }
    }

    if (projectsEl) {
      const rect = projectsEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        applyInvert(0);
        return;
      }
    }

    if (galleryEl) {
      const rect = galleryEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        const scrollableDist = rect.height - window.innerHeight;
        const progress = scrollableDist > 0 ? Math.max(0, Math.min(1, -rect.top / scrollableDist)) : 0;
        applyInvert(1 - progress);
        return;
      }
    }

    if (aboutEl) {
      const rect = aboutEl.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom > headerY) {
        applyInvert(1);
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

    applyInvert(1);
  }, [isMenuOpen, isHome, applyInvert]);

  useEffect(() => {
    updateHeaderColor();

    if (!isHome) {
      return;
    }

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHome, updateHeaderColor]);

  const handleToggle = () => {
    if (navState === 'closed') {
      setNavState('opening');
    } else if (navState === 'open' || navState === 'opening') {
      setNavState('closing');
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Show transition overlay immediately
    const overlay = document.querySelector('.page-transition-overlay') as HTMLDivElement;
    if (overlay) {
      gsap.set(overlay, { 
        opacity: 1, 
        display: 'block' 
      });
    }
    
    setPendingHref(href);
    setNavState('closing');
  };

  // Animate menu icon when state changes
  useEffect(() => {
    if (!menuIconRef.current) return;

    const isOpen = navState === 'opening' || navState === 'open';
    
    // Animate the icon container rotation
    gsap.to(menuIconRef.current, {
      rotate: 0,
      duration: 0.4,
      ease: "power2.inOut",
    });

    // Get all lines
    const lines = menuIconRef.current.querySelectorAll('line');
    const topLine = lines[0];
    const middleLine = lines[1];
    const bottomLine = lines[2];

    if (!topLine || !middleLine || !bottomLine) return;

    if (isOpen) {
      // Transform to "X" - use proper coordinates
      gsap.to(topLine, {
        attr: { x1: 4, y1: 4, x2: 20, y2: 20 },
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(middleLine, {
        opacity: 0,
        scaleX: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(bottomLine, {
        attr: { x1: 4, y1: 20, x2: 20, y2: 4 },
        duration: 0.4,
        ease: "power2.inOut",
      });
    } else {
      // Transform back to hamburger
      gsap.to(topLine, {
        attr: { x1: 4, y1: 7, x2: 20, y2: 7 },
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(middleLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.to(bottomLine, {
        attr: { x1: 4, y1: 17, x2: 20, y2: 17 },
        duration: 0.4,
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
          // Set initial state
          gsap.set(link, { 
            opacity: 0, 
            y: 30,
            scale: 0.8,
            rotateX: 15,
          });
          
          // Animate in with delay
          gsap.to(link, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.6,
            delay: 0.2 + index * 0.08,
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
            y: -30,
            scale: 0.7,
            rotateX: -15,
            duration: 0.3,
            delay: reverseIndex * 0.05,
            ease: "power2.in",
          });
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
        if (pendingHref) {
          router.push(pendingHref);
          setPendingHref(null);
        }
      }, 400);
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
            className="menu-btn outline-none bg-transparent flex items-center justify-center w-10 h-10 text-black border-2 border-black rounded-md p-1.5 hover:opacity-80 cursor-pointer"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
            onClick={handleToggle}
          >
            <div ref={menuIconRef} className="w-full h-full flex items-center justify-center">
              <svg
                className="w-full h-full stroke-current"
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
        className={`fixed inset-0 w-full h-screen bg-gradient-to-br from-zinc-950 to-zinc-800 text-white transform transition-transform duration-500 ease-in-out z-20 flex items-center justify-center ${
          isOverlayDown ? "translate-y-0" : "-translate-y-full"
        }`}
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
                className={`nav-menu-link transition-colors text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black uppercase tracking-wider ${
                  isActive(item.href)
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