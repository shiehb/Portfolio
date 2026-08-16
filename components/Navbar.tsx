'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const isMenuOpen = menuOpen;

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[70px] mx-auto my-2 px-2 py-6 flex justify-between items-center z-30 bg-transparent">
        <Image
          src="/img/logo.png"
          alt="Jericho Urbano Logo"
          width={100}
          height={40}
          priority
          className={`logo transition-all duration-350 w-auto h-auto ${
            isMenuOpen ? "logo-invert" : ""
          }`}
        />

        <div className="flex items-center justify-end gap-3 ml-auto">
          <button
            type="button"
            className={`menu-btn ${isMenuOpen ? "menu-btn-invert" : ""}`}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true">{isMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      <nav
        className={`fixed top-0 left-0 w-full h-screen h-screen-svh bg-linear-to-br from-zinc-950 to-zinc-800 transform transition-transform duration-400 z-20 flex items-center justify-center pt-20 ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        id="nav-menu"
        aria-label="Main navigation"
      >
        <ul className="list-none flex flex-col items-center gap-8 text-center m-0 p-0">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="nav-menu-link"
                onClick={() => setMenuOpen(false)}
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