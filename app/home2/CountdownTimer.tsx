"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import styles from "./home2.module.css";

const UNITS = [
  { label: "Days", seconds: 86400 },
  { label: "Hours", seconds: 3600 },
  { label: "Minutes", seconds: 60 },
  { label: "Seconds", seconds: 1 },
] as const;

type TimeUnit = { label: string; value: number };

function computeUnits(secondsRemaining: number): TimeUnit[] {
  let remaining = secondsRemaining;
  return UNITS.map(({ label, seconds }) => {
    const value = Math.floor(remaining / seconds);
    remaining -= value * seconds;
    return { label, value };
  });
}

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

function getServerSnapshot() {
  return null;
}

export default function CountdownTimer({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();

  // useSyncExternalStore re-renders whenever getSnapshot returns a
  // different reference, so it must return the *same* array as long as the
  // underlying value hasn't changed — otherwise every call (React checks
  // more than once per render) looks like a change and loops forever.
  // Caching by whole-second here also caps re-renders to once a second.
  const cacheRef = useRef<{ seconds: number; value: TimeUnit[] } | null>(null);
  const getSnapshot = useCallback(() => {
    const secondsRemaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (!cacheRef.current || cacheRef.current.seconds !== secondsRemaining) {
      cacheRef.current = { seconds: secondsRemaining, value: computeUnits(secondsRemaining) };
    }
    return cacheRef.current.value;
  }, [target]);

  // getServerSnapshot returns null so the server-rendered markup and the
  // client's first (pre-hydration) render match exactly — Date.now() would
  // otherwise differ between them and trigger a hydration mismatch. The
  // digits appear once the client takes over via getSnapshot.
  const timeLeft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!timeLeft) return null;

  return (
    <div className={styles.countdownWrap}>
      <p className={styles.countdownIntro}>Time until we gather in Bali</p>
      <div className={styles.countdown}>
        {timeLeft.map((unit) => (
          <div key={unit.label} className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{String(unit.value).padStart(2, "0")}</span>
            <span className={styles.countdownLabel}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
