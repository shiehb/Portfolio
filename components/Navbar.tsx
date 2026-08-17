'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [navState, setNavState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isMenuOpen = navState === 'opening' || navState === 'open';
  const isOverlayDown = navState === 'opening' || navState === 'open' || navState === 'closing';
  const isTextVisible = navState === 'open';

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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setPendingHref(href);
    setNavState('closing');
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[70px] mx-auto my-2 px-6 py-6 flex justify-between items-center z-30 bg-transparent">
        <Image
          src="/img/logo.png"
          alt="Jericho Urbano Logo"
          width={100}
          height={40}
          priority
          className={`logo transition-all duration-350 w-auto h-auto ${isMenuOpen ? "logo-invert" : ""
            }`}
        />

        <div className="flex items-center justify-end gap-3 ml-auto">
          <button
            type="button"
            className={`menu-btn ${isMenuOpen ? "menu-btn-invert" : ""}`}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
            onClick={handleToggle}
          >
            {isMenuOpen ? (
              <svg
                className="w-[55%] h-[55%] stroke-current"
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
                className="w-[55%] h-[55%] stroke-current"
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
        className={`fixed inset-0 w-full h-screen bg-gradient-to-br from-zinc-950 to-zinc-800 transform transition-transform duration-500 ease-in-out z-20 flex items-center justify-center ${isOverlayDown ? "translate-y-0" : "-translate-y-full"
          }`}
        id="nav-menu"
        aria-label="Main navigation"
      >
        <ul className="list-none flex flex-col items-center gap-8 text-center m-0 p-0">
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
                className="nav-menu-link"
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