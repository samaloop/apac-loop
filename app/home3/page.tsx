import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { event } from "../data/event";
import { agenda } from "../data/agenda";
import { pillars } from "../data/pillars";
import {
  CalendarIcon,
  UsersIcon,
  NetworkIcon,
  BadgeIcon,
  FrangipaniIcon,
} from "../components/motifs";
import RevealOnScroll from "./RevealOnScroll";
import styles from "./home3.module.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Home (Content Rework) | APAC Coaching Conference 2027",
  description:
    "Content and storytelling rework for APAC Coaching Conference 2027. Hero unchanged, everything after it rebuilt.",
};

const whyAttend = [
  {
    n: "01",
    title: "A community, not just an audience",
    body: event.highlights[0],
  },
  {
    n: "02",
    title: "Hands-on from the first morning",
    body: event.highlights[1],
  },
  {
    n: "03",
    title: "Conversations that continue after the badge comes off",
    body: event.highlights[2],
  },
  {
    n: "04",
    title: "Takeaways you can use on Monday morning",
    body: event.highlights[3],
  },
];

const audiences = [
  {
    title: "Coaches & Practitioners",
    body: "Sharpen your craft alongside peers working with real clients across the region.",
  },
  {
    title: "People & Culture Leaders",
    body: "See how coaching principles are being applied to build healthier, more adaptive organizations.",
  },
  {
    title: "Organizational Leaders",
    body: "Explore what it means to lead, and to change systems, in a way that coaching itself models.",
  },
  {
    title: "Emerging & Aspiring Coaches",
    body: "Learn directly from practitioners further along the path, and find your place in the APAC community.",
  },
];

const experience = [
  { icon: BadgeIcon, title: "Keynotes", body: "Big-room sessions on where coaching, leadership, and society are heading." },
  { icon: UsersIcon, title: "Workshops", body: "Hands-on breakout tracks you can apply the same week you get home." },
  { icon: NetworkIcon, title: "Conversations", body: "Panels and discussions built for debate." },
  { icon: CalendarIcon, title: "Networking", body: "Structured and unstructured time to actually meet the room." },
  { icon: FrangipaniIcon, title: "Reflection", body: "Space to process what you heard, in keeping with what coaching asks of us." },
];

const takeHome = [
  "A working network of coaches and leaders from across Asia Pacific",
  "Frameworks and approaches you can bring straight into your own practice",
  "A clearer view of where the coaching profession is headed next",
  "A sense of the community you're part of, beyond your own organization or country",
];

export default function Home3Page() {
  const nameParts = event.name.split(" ");
  const heroTitleHighlight = nameParts.pop() ?? event.name;
  const heroTitleLead = nameParts.join(" ");

  return (
    <div
      data-theme="home3"
      className={`${styles.page} ${cormorant.variable} ${manrope.variable} flex flex-col`}
    >
      {/* ============ HERO — unchanged, per the brief's hard constraint ============ */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/header_background_1.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_center] opacity-30 sm:object-center"
          />
          <Image
            src="/images/hero-dancer.webp"
            alt=""
            width={384}
            height={352}
            priority
            className="pointer-events-none absolute bottom-0 left-0 h-auto w-56 opacity-30 sm:w-72 md:w-96 lg:w-[26rem]"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24 pb-52 sm:pt-16 sm:pb-24">
          <div className="flex flex-col items-start gap-2">
            <Image src="/images/logo_apac.webp" alt="" width={140} height={79} className="h-24 w-auto sm:h-28" />
            <span className="text-sm font-bold sm:text-base">{event.tagline}</span>
          </div>

          <h1 className="max-w-4xl text-6xl font-extrabold uppercase leading-[1.04] tracking-tight sm:text-9xl">
            <span className="block">{heroTitleLead}</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, var(--gold-bright), var(--accent))" }}
            >
              {heroTitleHighlight}
            </span>
          </h1>

          <p className="max-w-2xl text-base leading-7 text-primary-foreground/70">{event.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-primary-foreground/90">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gold" />
              {event.date}
            </span>
            <span className="h-4 w-px bg-primary-foreground/30" aria-hidden />
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-gold" aria-hidden>
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {event.location}
            </span>
          </div>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Register Now
            </Link>
            <Link
              href="/speakers"
              className="flex h-12 items-center justify-center rounded-full border border-primary-foreground/30 px-8 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              Meet the Speakers
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 1. WHY THIS MATTERS ============ */}
      <section className={styles.onCharcoal}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-4xl px-6 py-28 text-center">
            <p className={`${styles.serif} text-3xl leading-snug sm:text-4xl md:text-5xl`}>
              The world is changing faster than our systems can keep up. AI is reshaping work,
              complexity is reshaping leadership, and old models of change are reaching their
              limits.
            </p>
            <p className={`mt-8 text-lg leading-8 ${styles.mutedOnDark}`}>
              Coaching sits at the center of that shift: helping individuals grow, and helping
              organizations and societies navigate what&apos;s next. {event.tagline} brings
              together the people asking the harder questions about people, about systems, and
              about the kind of society coaching should help build.
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 2. THREE PILLARS ============ */}
      <section className={styles.onIvory}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="max-w-2xl">
              <h2 className={`${styles.serif} text-4xl sm:text-5xl`}>Three Conference Pillars</h2>
              <p className={`mt-4 text-base leading-7 ${styles.muted}`}>{event.description}</p>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
              {pillars.map((pillar, i) => (
                <div key={pillar.id} className="flex flex-col gap-3">
                  <span className={`${styles.serif} text-5xl`} style={{ color: "var(--forest)" }}>
                    0{i + 1}
                  </span>
                  <h3 className="text-lg font-bold">{pillar.title}</h3>
                  <p className={`text-sm font-semibold italic ${styles.muted}`}>{pillar.question}</p>
                  <p className={`text-sm leading-6 ${styles.muted}`}>{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 3. WHY ATTEND ============ */}
      <section className={styles.onForest}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} max-w-xl text-4xl sm:text-5xl`}>
              What two days here actually gets you
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
              {whyAttend.map((item) => (
                <div key={item.n} className="flex gap-5">
                  <span className={`${styles.serif} shrink-0 text-3xl`} style={{ color: "var(--sand)" }}>
                    {item.n}
                  </span>
                  <div>
                    <h3 className="text-base font-bold">{item.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${styles.mutedOnDark}`}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ CTA BAND 1 ============ */}
      <section className={styles.onCharcoal2}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={`${styles.serif} max-w-xl text-2xl sm:text-3xl`}>
            If this sounds like your room, save your seat.
          </h2>
          <Link
            href="/register"
            className="flex h-12 shrink-0 items-center justify-center rounded-full bg-(--sand) px-8 text-sm font-semibold text-(--ink) transition-opacity hover:opacity-90"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* ============ 4. WHO IS THIS FOR ============ */}
      <section className={styles.onSand}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} max-w-xl text-4xl sm:text-5xl`}>
              Who is this for
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a) => (
                <div key={a.title} className="rounded-2xl bg-[var(--ivory)] p-6">
                  <h3 className="text-base font-bold">{a.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${styles.muted}`}>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 5. APAC COMMUNITY ============ */}
      <section className={styles.onCharcoal2}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className={`${styles.serif} text-4xl sm:text-5xl`}>
                  Presented by {event.organizer}
                </h2>
                <p className={`mt-6 text-base leading-7 ${styles.mutedOnDark}`}>
                  {event.organizer} exists to connect coaches, leaders, and practitioners across
                  the region: sharing practice, setting standards, and building a community that
                  extends well beyond any single event. {event.tagline} is hosted in partnership
                  with Loop Institute of Coaching, the official local partner in Bali, Indonesia.
                </p>
                <p className={`mt-4 text-base leading-7 ${styles.mutedOnDark}`}>
                  This conference is one place that community comes together in person: coaches,
                  leaders, and practitioners from across Asia Pacific, in the same room, for two
                  days.
                </p>
              </div>
              <div className="flex flex-col gap-6 rounded-2xl border border-white/10 p-8">
                <div className="flex flex-col items-start gap-2">
                  <span className={`${styles.label} ${styles.mutedOnDark}`}>Presented by</span>
                  <Image src="/images/logo_apac.webp" alt="Asia Pacific Alliance of Coaches" width={160} height={90} className="h-14 w-auto" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className={`${styles.label} ${styles.mutedOnDark}`}>Official local partner</span>
                  <Image src="/images/Logo-loop.webp" alt="Loop Institute of Coaching" width={160} height={55} className="h-9 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 6. WHY BALI ============ */}
      <section className={styles.onSand}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} flex max-w-2xl items-center gap-3 text-4xl sm:text-5xl`}>
              <FrangipaniIcon className="h-8 w-8 shrink-0 text-(--forest)" />
              Bali, Indonesia
            </h2>
            <p className={`mt-6 max-w-2xl text-lg leading-8 ${styles.muted}`}>
              Bali has long been a meeting point of cultures, of ideas, of people seeking
              something more intentional. It&apos;s a fitting home for a conference about
              what&apos;s next: a place where nature, community, and contemporary Asia Pacific
              life sit side by side. Beyond the sessions, expect space to reflect, connect, and be
              present, the same qualities coaching itself asks of us.
            </p>
            <Link
              href="/venue"
              className="mt-6 inline-block w-fit text-sm font-semibold hover:underline"
              style={{ color: "var(--forest)" }}
            >
              Read the Venue &amp; Bali guide
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 7. CONFERENCE EXPERIENCE ============ */}
      <section className={styles.onIvory}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} max-w-xl text-4xl sm:text-5xl`}>
              Two days, one Asia Pacific community
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {experience.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex flex-col gap-3">
                  <Icon className="h-7 w-7 text-(--forest)" />
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className={`text-sm leading-6 ${styles.muted}`}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 8. SPEAKERS ============ */}
      <section className={styles.onCharcoal}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
            <h2 className={`${styles.serif} text-4xl sm:text-5xl`}>
              Featured speakers
            </h2>
            <p className={`mx-auto mt-6 max-w-xl text-base leading-7 ${styles.mutedOnDark}`}>
              We&apos;re confirming an outstanding keynote lineup for {event.tagline}, with voices
              from coaching, leadership, organizational transformation, and society. Check
              back soon, or get in touch to be notified as speakers are announced.
            </p>
            <a
              href={`https://wa.me/${event.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--sand)", color: "var(--ink)" }}
            >
              Get Notified
            </a>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 9. AGENDA ============ */}
      <section className={styles.onIvory}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} max-w-xl text-4xl sm:text-5xl`}>
              Two days, start to finish
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
              {agenda.map((day) => (
                <div key={day.day}>
                  <div className={`${styles.hairline} flex items-baseline gap-3 pb-3`}>
                    <h3 className={`${styles.serif} text-2xl`}>{day.day}</h3>
                    <span className={`text-sm ${styles.muted}`}>{day.date}</span>
                  </div>
                  <ul className="mt-4 flex flex-col gap-4">
                    {day.sessions.map((session) => (
                      <li key={session.time} className="flex gap-4">
                        <span
                          className="w-14 shrink-0 text-sm font-bold"
                          style={{ color: "var(--forest)" }}
                        >
                          {session.time}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{session.title}</p>
                          <p className={`mt-1 text-sm leading-5 ${styles.muted}`}>
                            {session.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link
              href="/agenda"
              className="mt-10 inline-block w-fit text-sm font-semibold hover:underline"
              style={{ color: "var(--forest)" }}
            >
              View the full agenda
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ 10. TAKE HOME ============ */}
      <section className={styles.onForest}>
        <RevealOnScroll>
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className={`${styles.serif} max-w-xl text-4xl sm:text-5xl`}>
              What you leave with
            </h2>
            <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {takeHome.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--sand)" }}
                    aria-hidden
                  />
                  <span className={`text-base leading-7 ${styles.mutedOnDark}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className={styles.onCharcoal2}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`${styles.serif} max-w-xl text-3xl sm:text-4xl`}>
              Join us in Bali, {event.date}.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-(--on-dark-muted)">
              Registration is open now. Questions before you commit? Reach out and the team will
              get back to you.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center rounded-full bg-(--sand) px-8 text-sm font-semibold text-(--ink) transition-opacity hover:opacity-90"
            >
              Register Now
            </Link>
            <a
              href={`https://wa.me/${event.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Ask a Question
            </a>
          </div>
        </div>
      </section>

      {/* ============ PRESENTED BY — unchanged content, moved to the close ============ */}
      <section className={styles.onCharcoal}>
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 border-t border-white/10 pt-12 sm:flex-row sm:justify-center sm:gap-16">
            <div className="flex items-center gap-3">
              <span className={`${styles.label} ${styles.mutedOnDark}`}>
                Presented by
              </span>
              <a href="https://apacoaches.org/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/logo_apac.webp"
                  alt="Asia Pacific Alliance of Coaches"
                  width={192}
                  height={108}
                  className="h-18 w-auto"
                />
              </a>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-3">
              <span className={`${styles.label} ${styles.mutedOnDark}`}>
                Official local partner
              </span>
              <a href="https://www.loop-indonesia.com/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/Logo-loop.webp"
                  alt="Loop Institute of Coaching"
                  width={200}
                  height={68}
                  className="h-9 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
