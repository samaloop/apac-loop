"use client";

import { usePathname } from "next/navigation";
import { event } from "@/app/data/event";

export default function Footer() {
  const pathname = usePathname();
  const isHome2 = pathname === "/home2";

  if (isHome2) {
    // Continues the Monsoon Reef CTA band's dark teal-ink tone directly,
    // instead of handing off to the site's light cream footer mid-scroll.
    return (
      <footer className="bg-[#0d3b3a] text-[#f4faf7]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-[#f4faf7]/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Organized by{" "}
            <span className="font-medium text-[#f4faf7]">{event.organizer}</span>
          </p>
          <p>
            &copy; {new Date().getFullYear()} {event.organizer}. All rights reserved.
          </p>
        </div>
        <div className="border-t border-[#f4faf7]/10 px-6 py-4 text-center text-xs text-[#f4faf7]/50">
          <p>
            Developed by{" "}
            <a
              href="https://www.loop-indonesia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#f4faf7]/70 hover:text-[#ff6f59] hover:underline"
            >
              Loop Institute of Coaching
            </a>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-black/[.08] bg-surface-muted dark:border-white/[.08]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-foreground/70 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Organized by{" "}
          <span className="font-medium text-foreground">{event.organizer}</span>
        </p>
        <p>
          &copy; {new Date().getFullYear()} {event.organizer}. All rights reserved.
        </p>
      </div>
      <div className="border-t border-black/[.08] px-6 py-4 text-center text-xs text-foreground/50 dark:border-white/[.08]">
        <p>
          Developed by{" "}
          <a
            href="https://www.loop-indonesia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/70 hover:text-accent hover:underline"
          >
            Loop Institute of Coaching
          </a>
        </p>
      </div>
    </footer>
  );
}
