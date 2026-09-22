import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { event } from "../data/event";
import { agenda } from "../data/agenda";
import { pillars } from "../data/pillars";
import SectionHeading from "../components/SectionHeading";
import {
  WaveDivider,
  FrangipaniIcon,
  PalmFrond,
  PatraSideBorder,
  CalendarIcon,
  UsersIcon,
  NetworkIcon,
  BadgeIcon,
} from "../components/motifs";

export const metadata: Metadata = {
  title: "Home (Reconstructed) | APAC Coaching Conference 2027",
  description:
    "Reconstructed homepage flow for APAC Coaching Conference 2027 — for side-by-side comparison with the live homepage.",
};

const experienceItems = [
  { icon: CalendarIcon, label: "2 Days" },
  { icon: UsersIcon, label: "Keynotes & Workshops" },
  { icon: NetworkIcon, label: "Interactive Sessions" },
  { icon: BadgeIcon, label: "Asia Pacific Community" },
];

export default function Home2Page() {
  // Split the event name so the last word gets the gold-gradient treatment,
  // matching the poster's "THE NEXT" (plain) / "FRONTIER" (gold) layout.
  const nameParts = event.name.split(" ");
  const heroTitleHighlight = nameParts.pop() ?? event.name;
  const heroTitleLead = nameParts.join(" ");

  return (
    <div className="relative flex flex-col">
      <PatraSideBorder className="pointer-events-none absolute inset-y-0 left-4 z-50 hidden w-8 opacity-20 lg:block" />
      <PatraSideBorder className="pointer-events-none absolute inset-y-0 right-4 z-50 hidden w-8 opacity-20 lg:block" />

      {/* 1. Hero */}
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
            className="pointer-events-none absolute bottom-0 left-0 h-auto w-32 opacity-40 sm:w-40 md:w-56 lg:w-72"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24 pb-52 sm:py-32">
          <div className="flex flex-col items-start gap-2">
            <Image
              src="/images/logo_apac.webp"
              alt=""
              width={140}
              height={79}
              className="h-12 w-auto sm:h-26"
            />
            <span className="text-sm font-bold sm:text-base">{event.tagline}</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl">
            {heroTitleLead && <span className="block">{heroTitleLead}</span>}
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #f2c14e, #c75b39)" }}
            >
              {heroTitleHighlight}
            </span>
          </h1>

          <p className="max-w-2xl text-base leading-7 text-primary-foreground/70">
            {event.description}
          </p>
          <p className="max-w-2xl text-base leading-7 text-primary-foreground/70">
            Where coaches, leaders and changemakers across Asia Pacific come together to explore
            what&apos;s next for coaching, leadership and society.
          </p>

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
        <WaveDivider className="relative z-10 block h-10 w-full sm:h-16" color="var(--background)" />
      </section>

      {/* 2. Why This Conference */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="Why Now" title="The Next Frontier" />
        <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/70">
          The world is changing faster than our systems can keep up — AI is reshaping work,
          complexity is reshaping leadership, and old models of change are reaching their
          limits. Coaching sits at the center of this shift: not just helping individuals grow,
          but helping organizations and societies navigate what&apos;s next. APAC Coaching
          Conference 2027 brings together the people asking the harder questions — about people,
          about systems, and about the kind of society coaching should help build.
        </p>
      </section>

      {/* 3. Three Conference Pillars */}
      <section className="bg-surface-muted">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <SectionHeading eyebrow="What We Believe" title="Three Conference Pillars" />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex flex-col gap-2 rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15]"
              >
                <h3 className="text-xl font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm leading-6 text-foreground/70">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Keynote Speakers */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Featured Speakers"
          title="Keynote Speakers"
          description="Visionary voices from coaching, leadership, organizational transformation, and society — to be announced."
        />
        <div className="mt-10 rounded-3xl border border-dashed border-black/[.15] bg-background px-8 py-14 text-center dark:border-white/[.2] dark:bg-[#241c15]">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Coming Soon
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-foreground/70">
            We&apos;re confirming an outstanding keynote lineup for APAC Coaching Conference
            2027. Check back soon.
          </p>
        </div>
      </section>

      {/* 5. The Experience */}
      <section className="bg-surface-muted">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <SectionHeading eyebrow="The Experience" title="Two days, one Asia Pacific community" />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {experienceItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <Icon className="h-8 w-8 text-accent" />
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Program at a Glance */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="Program at a Glance" title="Two days, start to finish" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {agenda.map((day) => (
            <div
              key={day.day}
              className="flex flex-col gap-4 rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15]"
            >
              <div className="flex items-baseline gap-3">
                <h3 className="text-xl font-semibold text-foreground">{day.day}</h3>
                <span className="text-sm text-foreground/60">{day.date}</span>
              </div>
              <ul className="flex flex-col gap-3">
                {day.sessions.slice(0, 3).map((session) => (
                  <li key={session.time} className="flex gap-3 text-sm">
                    <span className="w-14 shrink-0 font-semibold text-accent">
                      {session.time}
                    </span>
                    <span className="text-foreground/80">{session.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link
          href="/agenda"
          className="mt-6 inline-block w-fit text-sm font-semibold text-accent hover:underline"
        >
          View Full Agenda &rarr;
        </Link>
      </section>

      {/* 7. Bali — More Than a Destination */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <PalmFrond className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 text-primary-foreground/10" />
        <PalmFrond className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rotate-180 text-primary-foreground/10" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
          <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold">
            <FrangipaniIcon className="h-4 w-4" />
            Bali, Indonesia
          </span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            More Than a Destination
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-primary-foreground/70">
            Bali has long been a meeting point — of cultures, of ideas, of people seeking
            something more intentional. It&apos;s a fitting home for a conference about
            what&apos;s next: a place where nature, community, and contemporary Asia Pacific life
            sit side by side. Beyond the sessions, expect space to reflect, connect, and be
            present — the same qualities coaching itself asks of us.
          </p>
          <Link href="/venue" className="w-fit text-sm font-semibold text-gold hover:underline">
            Venue &amp; Bali Guide &rarr;
          </Link>
        </div>
      </section>

      {/* 8. Registration / Early Bird */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Pricing"
          title="Registration Opening Soon"
          description="Pricing and Early Bird registration will be announced soon. Be the first to know when registration opens."
        />
        <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-surface-muted p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Don&apos;t miss Early Bird</h3>
            <p className="mt-1 max-w-xl text-sm text-foreground/70">
              Get in touch with the team to be notified as soon as registration and Early Bird
              pricing go live.
            </p>
          </div>
          <a
            href={`https://wa.me/${event.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Get Updates
          </a>
        </div>
      </section>

      {/* 9. Partners & Sponsors */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Partners & Sponsors"
          title="Partnership opportunities are now open"
          description="Join organizations investing in the future of coaching across Asia Pacific."
        />
        <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl border border-black/[.08] bg-background p-8 dark:border-white/[.145] dark:bg-[#241c15] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-foreground/70">
            Get in touch with the team to learn about sponsorship and partnership packages for
            APAC Coaching Conference 2027.
          </p>
          <a
            href={`https://wa.me/${event.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Become a Partner
          </a>
        </div>
      </section>

      <WaveDivider className="block h-10 w-full sm:h-16" color="var(--accent)" />

      {/* Closing CTA band */}
      <section className="relative overflow-hidden bg-accent text-accent-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Join us in Bali, {event.date}.
          </h2>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Register Now
          </Link>
        </div>
        <WaveDivider className="block h-10 w-full sm:h-16" color="var(--surface-muted)" />
      </section>

      {/* 10. Presented by / Official Local Partner — closing credibility strip */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center gap-6 border-t border-black/[.08] pt-12 dark:border-white/[.145] sm:flex-row sm:justify-center sm:gap-16">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
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
          <div className="hidden h-8 w-px bg-black/[.08] dark:bg-white/[.145] sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Official Local Partner
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
      </section>
    </div>
  );
}
