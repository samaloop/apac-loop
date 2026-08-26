import Link from "next/link";
import { event } from "./data/event";
import { speakers } from "./data/speakers";
import { sponsorTiers } from "./data/sponsors";
import SectionHeading from "./components/SectionHeading";
import SpeakerCard from "./components/SpeakerCard";
import { PalmFrond, WaveDivider } from "./components/motifs";

export default function Home() {
  const featuredSpeakers = speakers.slice(0, 3);
  const platinumSponsors = sponsorTiers[0]?.sponsors ?? [];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <PalmFrond className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 text-primary-foreground/10 sm:h-96 sm:w-96" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-24 sm:py-32">
          <span className="w-fit rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
            {event.date} &middot; {event.location}
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {event.name}
          </h1>
          <p className="max-w-2xl text-xl text-primary-foreground/80">
            {event.tagline}
          </p>
          <p className="max-w-2xl text-base leading-7 text-primary-foreground/70">
            {event.description}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
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
        <WaveDivider className="block h-10 w-full sm:h-16" color="var(--background)" />
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
