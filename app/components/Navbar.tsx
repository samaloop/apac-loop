"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/agenda", label: "Agenda" },
  { href: "/venue", label: "Venue" },
  { href: "/pricing", label: "Pricing" },
  { href: "/speakers", label: "Speakers" },
  { href: "/sponsors", label: "Sponsors" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // /home2 (Monsoon Reef concept) floats a transparent header over its hero
  // video instead of the site's usual solid navy bar.
  const isHome2 = pathname === "/home2";

  return (
    <header
      className={
        isHome2
          ? "fixed inset-x-0 top-0 z-50 bg-transparent text-[#0d3b3a]"
          : "bg-primary text-primary-foreground"
      }
    >
      {/* Top row: logo, centered from sm up (the mobile toggle is sm:hidden, so
          the logo is the only child left in this row at that breakpoint) */}
      <div
        className={
          isHome2
            ? "mx-4 mt-4 flex items-center justify-between gap-4 rounded-full border border-white/30 bg-white/20 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:mx-8 lg:mx-auto lg:max-w-5xl"
            : "mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"
        }
      >
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex flex-col leading-tight"
        >
          {isHome2 ? (
            <Image
              src="/images/logo_apac.webp"
              alt="Asia Pacific Alliance of Coaches"
              width={140}
              height={79}
              className="h-10 w-auto"
            />
          ) : (
            <>
              <span className="text-lg font-semibold">Asia Pacific Alliance of Coaches Coaching Conference 2027</span>
              <span className="text-xs text-primary-foreground/70">
                Inspiring People . Transforming System . Shaping Society
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav: hidden below sm, shown as a row from sm up */}
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-accent ${
                  isActive
                    ? "text-accent"
                    : isHome2
                      ? "text-[#0d3b3a]/80"
                      : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/register"
            className="rounded-full bg-accent px-4 py-1.5 text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Register
          </Link>
        </nav>

        {/* Mobile menu toggle: shown below sm, hidden from sm up */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:hidden ${
            isHome2 ? "hover:bg-[#0d3b3a]/10" : "hover:bg-primary-foreground/10"
          }`}
        >
          {isMenuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown panel: only rendered below sm, only when open */}
      {isMenuOpen && (
        <nav
          className={
            isHome2
              ? "mx-4 mt-2 flex flex-col gap-1 rounded-3xl border border-white/30 bg-white/70 px-4 py-4 text-sm font-medium shadow-lg backdrop-blur-xl sm:hidden"
              : "flex flex-col gap-1 border-t border-primary-foreground/10 px-6 py-4 text-sm font-medium sm:hidden"
          }
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? isHome2
                      ? "bg-[#0d3b3a]/10 text-accent"
                      : "bg-primary-foreground/10 text-accent"
                    : isHome2
                      ? "text-[#0d3b3a]/80 hover:bg-[#0d3b3a]/10"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 rounded-full bg-accent px-4 py-2.5 text-center text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Register
          </Link>
        </nav>
      )}
    </header>
  );
}
