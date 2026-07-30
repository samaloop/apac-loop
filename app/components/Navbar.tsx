"use client";

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

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-semibold">Loop Institute of Coaching</span>
          <span className="text-xs text-primary-foreground/70">
            Loop Coaching Summit 2026
          </span>
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
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
        </nav>
      </div>
    </header>
  );
}
