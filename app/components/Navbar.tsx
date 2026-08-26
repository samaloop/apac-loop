"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/agenda", label: "Agenda" },
  { href: "/venue", label: "Venue" },
  { href: "/speakers", label: "Speakers" },
  { href: "/sponsors", label: "Sponsors" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex flex-col leading-tight"
        >
          <span className="text-lg font-semibold">APAC Coaching Conference 2027</span>
          <span className="text-xs text-primary-foreground/70">
            Inspiring People . Transforming System . Shaping Society
          </span>
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
                  isActive ? "text-accent" : "text-primary-foreground/80"
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
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/10 sm:hidden"
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
        <nav className="flex flex-col gap-1 border-t border-primary-foreground/10 px-6 py-4 text-sm font-medium sm:hidden">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-primary-foreground/10 text-accent"
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
