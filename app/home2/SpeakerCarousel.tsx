"use client";

import { useState } from "react";
import Link from "next/link";
import type { Speaker } from "@/app/data/speakers";
import { PersonIcon } from "@/app/components/motifs";
import styles from "./home2.module.css";

export default function SpeakerCarousel({ speakers }: { speakers: Speaker[] }) {
  const [index, setIndex] = useState(0);
  const speaker = speakers[index];

  function goTo(next: number) {
    setIndex((next + speakers.length) % speakers.length);
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselCard} key={speaker.id}>
        <div className={styles.carouselPhoto} style={{ backgroundColor: speaker.color }}>
          <PersonIcon className={styles.carouselPhotoIcon} />
        </div>
        <div className={styles.carouselInfo}>
          <h3>{speaker.name}</h3>
          <div className={styles.carouselMeta}>
            <span>{speaker.role}</span>
            <span className={styles.carouselMetaDot} aria-hidden>
              &bull;
            </span>
            <span>{speaker.company}</span>
          </div>
          <p>{speaker.bio}</p>
          <div className={styles.carouselActions}>
            <Link href="/register" className={styles.btnPrimary}>
              Register Now
            </Link>
            <Link href="/speakers" className={styles.btnGhost}>
              View All Speakers
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.carouselNav}>
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous speaker"
          className={styles.carouselArrow}
        >
          &#8249;
        </button>
        <div className={styles.carouselThumbs}>
          {speakers.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.name}`}
              aria-current={i === index}
              className={`${styles.carouselThumb} ${i === index ? styles.carouselThumbActive : ""}`}
              style={{ backgroundColor: s.color }}
            >
              <PersonIcon className={styles.carouselThumbIcon} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next speaker"
          className={styles.carouselArrow}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}
