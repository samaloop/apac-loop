"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./home3.module.css";

// Fades/slides a section in the first time it scrolls into view. Content
// stays in the DOM throughout (only opacity/transform change), so it reads
// fine for screen readers and crawlers regardless of the animation, and
// prefers-reduced-motion collapses the transition to near-instant.
export default function RevealOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${isVisible ? styles.revealVisible : ""}`}>
      {children}
    </div>
  );
}
