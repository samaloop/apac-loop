import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Unbounded, Plus_Jakarta_Sans } from "next/font/google";
import { event } from "../data/event";
import { speakers } from "../data/speakers";
import { sponsorTiers } from "../data/sponsors";
import { pricingTiers } from "../data/pricing";
import { agenda } from "../data/agenda";
import { venue } from "../data/venue";
import { UsersIcon, CalendarIcon, NetworkIcon, BadgeIcon } from "../components/motifs";
import SpeakerCarousel from "./SpeakerCarousel";
import CountdownTimer from "./CountdownTimer";
import RevealOnScroll from "./RevealOnScroll";
import styles from "./home2.module.css";

// Paired with event.highlights by index — purely a presentational mapping
// for this page, kept here rather than on the shared event data.
const highlightIcons = [UsersIcon, CalendarIcon, NetworkIcon, BadgeIcon];

const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home (Monsoon Reef concept) | APAC Coaching Conference 2027",
  description: "Alternate homepage design concept for APAC Coaching Conference 2027 — Monsoon Reef.",
};

export default function Home2Page() {
  const platinumSponsors = sponsorTiers.find((tier) => tier.tier === "Platinum")?.sponsors ?? [];
  const otherSponsors = sponsorTiers
    .filter((tier) => tier.tier !== "Platinum")
    .flatMap((tier) => tier.sponsors);
  const superEarlyBird = pricingTiers.find((tier) => tier.id === "super-early-bird");

  const nameParts = event.name.split(" ");
  const heroTitleHighlight = nameParts.pop() ?? event.name;
  const heroTitleLead = nameParts.join(" ");

  return (
    <div className={`${styles.page} ${unbounded.variable} ${plusJakarta.variable}`}>
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="/videos/homepage-vid-2.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.heroBg}>
          <span
            className={styles.petal}
            style={{
              width: 70,
              height: 70,
              left: "8%",
              top: "22%",
              background: "var(--r-coral)",
              opacity: 0.75,
              ["--r" as string]: "10deg",
            }}
          />
          <span
            className={styles.petal}
            style={{
              width: 50,
              height: 50,
              right: "14%",
              top: "14%",
              background: "var(--r-sun)",
              opacity: 0.8,
              ["--r" as string]: "-8deg",
              animationDelay: ".6s, 1.2s",
            }}
          />
          <span
            className={styles.petal}
            style={{
              width: 90,
              height: 90,
              right: "8%",
              bottom: "18%",
              background: "var(--r-aqua)",
              opacity: 0.6,
              ["--r" as string]: "6deg",
              animationDelay: "1.4s, .3s",
            }}
          />
        </div>
        <div className={styles.wrap}>
          <div className={styles.heroCard}>
            <span className={styles.eyebrow}>{event.tagline}</span>
            <h1>
              {heroTitleLead && <>{heroTitleLead} </>}
              <span className={styles.pop}>{heroTitleHighlight}</span>
            </h1>
            <p>{event.description}</p>
            <div className={styles.metaRow}>
              <span className={styles.pill}>{event.date}</span>
              <span className={styles.pill}>{event.location}</span>
            </div>
            <div className={styles.ctaRow}>
              <Link href="/register" className={styles.btnPrimary}>
                Register Now
              </Link>
              <Link href="/speakers" className={styles.btnGhost}>
                Meet the Speakers
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.wave}>
          <svg className={styles.waveBack} viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path
              d="M0 32 C 180 60,360 4,540 30 C 720 56,900 4,1080 30 C 1260 56,1350 40,1440 30 L1440 64 L0 64 Z"
              fill="#37c9c1"
            />
          </svg>
          <svg className={styles.waveFront} viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path
              d="M0 40 C 200 10,380 56,560 34 C 760 10,940 56,1120 34 C 1300 14,1380 34,1440 30 L1440 64 L0 64 Z"
              fill="#f4faf7"
            />
          </svg>
        </div>
      </section>

      <RevealOnScroll>
        <section className={styles.band}>
          <div className={styles.wrap}>
            <span className={styles.eyebrow}>Presented By</span>
            <div className={styles.creditRow}>
              <span className={styles.creditItem}>
                <Image
                  src="/images/logo_apac.webp"
                  alt="Asia Pacific Alliance of Coaches"
                  width={120}
                  height={68}
                  className={styles.creditLogo}
                />
                Organizer — <b>{event.organizer}</b>
              </span>
              <span className={styles.creditItem}>
                <Image
                  src="/images/Logo-loop.webp"
                  alt="Loop Institute of Coaching"
                  width={110}
                  height={38}
                  className={styles.creditLogo}
                />
                Local Partner — <b>Loop Institute of Coaching</b>
              </span>
            </div>
            <ul className={styles.highlights}>
              {event.highlights.map((highlight, i) => {
                const Icon = highlightIcons[i] ?? UsersIcon;
                return (
                  <li key={highlight}>
                    <Icon className={styles.highlightIcon} />
                    <span className={styles.highlightLabel}>{highlight}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className={styles.band}>
          <div className={styles.wrap}>
            <h2>Featured Speakers</h2>
            <SpeakerCarousel speakers={speakers} />
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className={styles.band}>
          <div className={styles.wrap}>
            <span className={styles.eyebrow}>What To Expect</span>
            <div className={styles.agendaVenueGrid}>
              <div className={styles.infoPanel}>
                <h3>Agenda</h3>
                {agenda[0] && (
                  <>
                    <p className={styles.infoPanelMeta}>
                      {agenda[0].day} · {agenda[0].date}
                    </p>
                    <ul className={styles.miniTimeline}>
                      {agenda[0].sessions.slice(0, 3).map((session) => (
                        <li key={session.time}>
                          <span className={styles.miniTimelineTime}>{session.time}</span>
                          <span>{session.title}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <Link href="/agenda" className={styles.btnGhost}>
                  View Full Agenda
                </Link>
              </div>
              <div className={styles.infoPanel}>
                <h3>Venue</h3>
                <p className={styles.infoPanelMeta}>{venue.name}</p>
                <p>{venue.description}</p>
                <Link href="/venue" className={styles.btnGhost}>
                  Venue &amp; Bali Guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {superEarlyBird && (
        <RevealOnScroll>
          <section className={styles.band}>
            <div className={styles.wrap}>
              <span className={styles.eyebrow}>Pricing</span>
              <CountdownTimer targetISO={event.startDateISO} />
              <div className={styles.pricingCard}>
                <div className={styles.pricingInfo}>
                  <span className={styles.pricingBadge}>{superEarlyBird.statusLabel}</span>
                  <h3>{superEarlyBird.name}</h3>
                  <p>{superEarlyBird.description}</p>
                </div>
                <div className={styles.pricingAction}>
                  <div className={styles.pricingPrice}>
                    <b>${superEarlyBird.nonMemberPrice}</b>
                    <span>per ticket</span>
                  </div>
                  <Link href={`/register?tier=${superEarlyBird.id}`} className={styles.btnPrimary}>
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      <RevealOnScroll>
        <section className={styles.band}>
          <div className={styles.wrap}>
            <h2>Backed By</h2>
            {platinumSponsors.length > 0 && (
              <div className={styles.platinumRow}>
                {platinumSponsors.map((sponsor) => (
                  <div key={sponsor.id} className={styles.platinumCard}>
                    <span className={styles.platinumBadge}>Platinum Sponsor</span>
                    <span className={styles.platinumName}>{sponsor.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.sponsorMarquee}>
            <div className={styles.sponsorTrack}>
              {[...otherSponsors, ...otherSponsors].map((sponsor, index) => (
                <span key={`${sponsor.id}-${index}`}>{sponsor.name}</span>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <section className={styles.cta}>
        <div className={styles.wrap}>
          <h2>Join us where the reef meets the rain, {event.location} — {event.date}.</h2>
          <Link href="/register" className={styles.btnPrimary}>
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}
