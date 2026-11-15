"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntil(target: number): Remaining {
  const total = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

// Live countdown to the conference opening. Renders dashes on the server
// and first paint (the time differs per visitor), then ticks every second.
export default function Countdown({ startsAt }: { startsAt: string }) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = new Date(startsAt).getTime();
    const tick = () => setRemaining(remainingUntil(target));
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [startsAt]);

  return (
    <div className="flex items-start gap-3 sm:gap-6" role="timer" aria-label="Time until the conference opens">
      {UNITS.map(({ key, label }, index) => (
        <div key={key} className="flex items-start gap-3 sm:gap-6">
          {index > 0 && (
            <span className="pt-1 text-2xl font-bold text-(--brand-coral) sm:text-4xl" aria-hidden>
              :
            </span>
          )}
          <div className="flex min-w-14 flex-col items-center gap-1 sm:min-w-20">
            <span className="text-4xl font-bold tabular-nums text-(--brand-ink) sm:text-6xl">
              {remaining ? String(remaining[key]).padStart(2, "0") : "--"}
            </span>
            <span className="text-xs font-semibold text-(--brand-ink)">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
