"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./home3.module.css";

// Fades/slides a section in the first time it scrolls into view. Content is
// visible in the server HTML; the hidden state is armed here (data-js) only
// for sections that start below the fold, so nothing stays blank if the
// script never runs. prefers-reduced-motion collapses the transition.
export default function RevealOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || node.getBoundingClientRect().top < window.innerHeight) return;

    node.setAttribute("data-js", "");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add(styles.revealVisible);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.reveal}>
      {children}
    </div>
  );
}
