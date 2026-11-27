"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { helpWhatsAppUrl } from "@/app/data/event";
import RegisterLink from "@/app/components/RegisterLink";

// Navigation from the redesign. /pricing, /speakers and /sponsors still
// exist but are no longer linked here.
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/agenda", label: "Agenda" },
  { href: "/venue", label: "Venue & Bali" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`py-2 uppercase transition-colors hover:text-(--brand-yellow) ${
              isActive ? "text-(--brand-yellow)" : "text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <a
        href={helpWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="py-2 uppercase text-white transition-colors hover:text-(--brand-yellow)"
      >
        Help
      </a>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // Figma: the homepage header is #00112c (--brand-night, the hero's navy),
    // every other page's header is the brand blue of its hero.
    <header
      className={`${pathname === "/" ? "bg-(--brand-night)" : "bg-(--brand-blue)"} font-[family-name:var(--font-brand)] text-white`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-6 px-6 py-4">
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <NavLinks pathname={pathname} />
          <RegisterLink
            href="/register"
            className="btn-yellow-on-dark flex h-12 items-center rounded-full bg-(--brand-yellow) px-7 text-sm font-bold uppercase text-(--brand-ink)"
          >
            Register now
          </RegisterLink>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
            {isMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/15 px-6 py-4 text-sm md:hidden">
          <NavLinks pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
          <RegisterLink
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="btn-yellow-on-dark mt-3 flex h-12 items-center justify-center rounded-full bg-(--brand-yellow) text-sm font-bold uppercase text-(--brand-ink)"
          >
            Register now
          </RegisterLink>
        </nav>
      )}
    </header>
  );
}
