import Image from "next/image";
import Link from "next/link";
import { event } from "./data/event";
import { speakers } from "./data/speakers";
import { sponsorTiers } from "./data/sponsors";
import SectionHeading from "./components/SectionHeading";
import SpeakerCard from "./components/SpeakerCard";
import { WaveDivider } from "./components/motifs";

export default function Home() {
  const featuredSpeakers = speakers.slice(0, 3);
  const platinumSponsors = sponsorTiers[0]?.sponsors ?? [];

  // Split the event name so the last word gets the gold-gradient treatment,
  // matching the poster's "THE NEXT" (plain) / "FRONTIER" (gold) layout.
  const nameParts = event.name.split(" ");
  const heroTitleHighlight = nameParts.pop() ?? event.name;
  const heroTitleLead = nameParts.join(" ");

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/header_background_1.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_center] sm:object-center"
          />
          <Image
            src="/images/hero-dancer.webp"
            alt=""
            width={384}
            height={352}
            priority
            className="pointer-events-none absolute bottom-0 left-0 h-auto w-32 sm:w-40 md:w-56 lg:w-72"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-24 pb-52 sm:py-32">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo_apac.webp"
              alt=""
              width={140}
              height={79}
              className="h-20 w-auto"
            />
            
          </div>
          <span className="text-sm font-bold sm:text-base">{event.tagline}</span>

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

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-primary-foreground/90">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-gold" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
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

      <section className="mx-auto w-full max-w-6xl px-6 pt-12">
        <div className="flex flex-col items-center gap-6 border-b border-black/[.08] pb-12 dark:border-white/[.145] sm:flex-row sm:justify-center sm:gap-16">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Presented by
            </span>
            <Image
              src="/images/logo_apac.webp"
              alt="Asia Pacific Alliance of Coaches"
              width={192}
              height={108}
              className="h-18 w-auto"
            />
          </div>
          <div className="hidden h-8 w-px bg-black/[.08] dark:bg-white/[.145] sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Official Local Partner
            </span>
            <Image
              src="/images/Logo-loop.webp"
              alt="Loop Institute of Coaching"
              width={200}
              height={68}
              className="h-9 w-auto"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
          <SectionHeading
            eyebrow="About the Summit"
            title="Two days, one growing coaching community"
            description={event.description}
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {event.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-2xl border border-black/[.08] bg-background p-4 text-sm text-foreground/80 dark:border-white/[.145] dark:bg-[#241c15]"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/agenda"
            className="flex flex-col gap-2 rounded-3xl border border-black/[.08] bg-background p-6 transition-colors hover:border-accent dark:border-white/[.145] dark:bg-[#241c15]"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-accent">
              Agenda
            </span>
            <span className="text-lg font-semibold text-foreground">
              See the full Day 1 &amp; Day 2 schedule &rarr;
            </span>
          </Link>
          <Link
            href="/venue"
            className="flex flex-col gap-2 rounded-3xl border border-black/[.08] bg-background p-6 transition-colors hover:border-accent dark:border-white/[.145] dark:bg-[#241c15]"
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-accent">
              Venue &amp; Bali Guide
            </span>
            <span className="text-lg font-semibold text-foreground">
              Venue, hotels, and things to do &rarr;
            </span>
          </Link>
        </div>
      </section>

      <section className="bg-surface-muted">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
          <SectionHeading
            eyebrow="Featured Speakers"
            title="Learn from practitioners shaping coaching in Indonesia"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSpeakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
          <Link
            href="/speakers"
            className="w-fit text-sm font-semibold text-accent hover:underline"
          >
            View all speakers &rarr;
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Our Sponsors"
            title="Backed by organizations investing in coaching"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {platinumSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex h-24 items-center justify-center rounded-2xl border border-black/[.08] bg-background px-4 text-center text-sm font-medium text-foreground/80 dark:border-white/[.145] dark:bg-[#241c15]"
              >
                {sponsor.name}
              </div>
            ))}
          </div>
          <Link
            href="/sponsors"
            className="w-fit text-sm font-semibold text-accent hover:underline"
          >
            View all sponsors &rarr;
          </Link>
        </div>
      </section>

      <WaveDivider className="block h-10 w-full sm:h-16" color="var(--accent)" />

      <section className="relative overflow-hidden bg-accent text-accent-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Join us in Bali September 2027.
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
    </div>
  );
}
