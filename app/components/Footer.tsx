import { event } from "@/app/data/event";

export default function Footer() {
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
    </footer>
  );
}
