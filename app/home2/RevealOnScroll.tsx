"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./home2.module.css";

// Fades/slides a section in the first time it scrolls into view. Content
// stays in the DOM the whole time (just opacity/transform), so it reads
// fine for screen readers and crawlers regardless of the animation.
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
      { threshold: 0.15 }
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
