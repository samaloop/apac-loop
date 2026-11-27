import Image from "next/image";
import Link from "next/link";
import { event, helpWhatsAppUrl } from "./data/event";
import { pillars } from "./data/pillars";
import { venue } from "./data/venue";
import Countdown from "./components/Countdown";
import RegisterLink from "@/app/components/RegisterLink";

// Speakers confirmed so far (from the design).
const confirmedSpeakers = [
  {
    name: "Dr Brian Underhill",
    role: "Founder and CEO of CoachSource",
    photo: "/images/design/speaker-brian-underhill.webp",
  },
  {
    name: "Jean-François Cousin",
    role: "Master Certified Coach",
    photo: "/images/design/speaker-jean-francois-cousin.webp",
  },
];

type MysteryColor = "yellow" | "coral" | "teal" | "lilac";

const mysteryFirstRow = ["teal", "lilac"] as const;
const mysteryGrid = [
  "yellow", "coral", "teal", "lilac", "yellow", "teal",
  "coral", "yellow", "teal", "lilac", "coral", "lilac",
] as const;

const pillarColors: MysteryColor[] = ["coral", "teal", "yellow"];

const days = [
  {
    label: "Day 1",
    date: "22 September",
    title: "Gather · Expand · Connect",
    body: "Opening experiences, featured voices and facilitated connection.",
  },
  {
    label: "Day 2",
    date: "23 September",
    title: "Explore · Integrate · Act",
    body: "Practical exploration, collective sense-making and a forward-looking close.",
  },
];

const ticketInclusions = [
  "Two-day conference access",
  "Learning and connection experiences",
  "Event materials",
];

const tickets = [
  { name: "APAC Member", audience: "For current APAC members", featured: false },
  { name: "General Admission", audience: "For coaches, leaders and changemakers", featured: true },
  { name: "Group Pass", audience: "For teams learning together", featured: false },
];

const faqs = [
  {
    question: "Who is the conference for?",
    answer:
      "Experienced coaches, emerging practitioners, coaching educators and organisational leaders from across the Asia-Pacific region and beyond.",
  },
  {
    question: "Where in Bali will it take place?",
    answer:
      "Venue details and recommended accommodation will be shared as soon as they are confirmed.",
  },
  {
    question: "What is included with registration?",
    answer:
      "Two-day conference access, learning and connection experiences, and event materials.",
  },
  {
    question: "Will there be virtual access?",
    answer: "Details on virtual access will be announced with the full program.",
  },
  {
    question: "How can my organization become a partner?",
    answer:
      "Contact the conference team to learn about sponsorship and partnership packages.",
  },
];

const colorClass: Record<MysteryColor, string> = {
  yellow: "bg-(--brand-yellow)",
  coral: "bg-(--brand-coral)",
  teal: "bg-(--brand-teal)",
  lilac: "bg-(--brand-lilac)",
};

// Concentric rings, the design's recurring motif (speaker section, cards).
const rings = (at: string, step: number, alpha: number) =>
  `repeating-radial-gradient(circle at ${at}, transparent 0 ${step - 1}px, rgb(255 255 255 / ${alpha}) ${step - 1}px ${step}px)`;

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.12em] sm:text-sm ${className}`}>
      {children}
    </p>
  );
}

function MysteryCard({ color, size = "sm" }: { color: MysteryColor; size?: "sm" | "lg" }) {
  return (
    <div className={`flex flex-col overflow-hidden bg-white ${size === "lg" ? "w-36 sm:w-40" : "w-28 sm:w-32"}`}>
      <div
        className={`flex aspect-[4/5] items-center justify-center ${colorClass[color]}`}
        style={{ backgroundImage: rings("50% 50%", 14, 0.35) }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-2xl font-extrabold text-(--brand-ink)">
          ?
        </span>
      </div>
      <div className={size === "lg" ? "h-16" : "h-12"} aria-hidden />
      <span className="sr-only">Speaker to be announced</span>
    </div>
  );
}

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
    </div>
  );
}

export default function Home() {
  // "THE NEXT" plain, "FRONTIER" in the gold gradient, as on the poster.
  const nameParts = event.name.split(" ");
  const heroTitleHighlight = nameParts.pop() ?? event.name;
  const heroTitleLead = nameParts.join(" ");

  return (
    <div
      className="flex flex-col text-(--brand-text)"
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-(--brand-night) text-white">
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
            className="pointer-events-none absolute bottom-0 left-0 h-auto w-28 sm:w-40 md:w-48 lg:w-56"
          />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <Image src="/images/logo_apac.webp" alt="APAC" width={140} height={79} className="h-14 w-auto self-start sm:h-20" />
          <p className="text-lg font-bold sm:text-2xl">{event.tagline}</p>
          <h1 className="max-w-3xl text-5xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
            {heroTitleLead && <span className="block">{heroTitleLead}</span>}
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(180deg, var(--brand-yellow), var(--brand-gold) 55%, #b9822a)" }}
            >
              {heroTitleHighlight}
            </span>
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium sm:text-base">
            <span>Inspiring People</span>
            <span className="h-1.5 w-1.5 rounded-full bg-(--brand-gold)" aria-hidden />
            <span>Transforming Systems</span>
            <span className="h-1.5 w-1.5 rounded-full bg-(--brand-gold)" aria-hidden />
            <span>Shaping Society</span>
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-sm font-medium sm:pl-14 sm:text-base">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-(--brand-gold)" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              {event.date}
            </span>
            <span className="h-6 w-px bg-white/60" aria-hidden />
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-(--brand-gold)" aria-hidden>
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {event.location}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-8 pl-28 sm:pl-44 md:pl-14">
            <a href="https://apacoaches.org/" target="_blank" rel="noopener noreferrer" className="flex flex-col text-xs transition-colors hover:text-(--brand-yellow)">
              <span className="text-white/80">Presented by</span>
              <span className="font-bold">{event.organizer}</span>
            </a>
            <span className="h-8 w-px bg-white/50" aria-hidden />
            <a href="https://www.loop-indonesia.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs transition-opacity hover:opacity-75">
              <span className="text-white/80">Official Local Partner</span>
              <Image src="/images/Logo-loop.webp" alt="Loop Institute of Coaching" width={200} height={68} className="h-8 w-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="bg-(--brand-cream)">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-16 pb-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold uppercase text-(--brand-gold) sm:text-xl">Bali time</p>
            <p className="text-lg font-bold uppercase text-(--brand-ink) sm:text-xl">See you at the frontier</p>
          </div>
          <Countdown startsAt={event.startsAt} />
        </div>
      </section>

      {/* Intro */}
      <section className="bg-(--brand-cream)">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 pt-10 pb-24 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-gold)">More than a conference</Eyebrow>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-(--brand-ink) sm:text-5xl">
              Where coaching meets{" "}
              <em className="font-bold text-(--brand-gold)">collective possibility.</em>
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:pt-6">
            <p className="font-semibold leading-7 text-(--brand-ink)">
              The future of coaching is unfolding, and the next frontier begins with us.
            </p>
            <p className="leading-7">
              Join the Asia Pacific Alliance of Coaches (APAC) in Bali for a gathering of coaching
              professionals, thought leaders, practitioners and change-makers from across the
              Asia-Pacific region and beyond.
            </p>
            <Link
              href="/about"
              className="link-arrow mt-2 flex w-fit items-center gap-2 border-b-2 border-(--brand-ink) pb-1 text-sm font-bold text-(--brand-ink)"
            >
              Discover the experience
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section
        className="bg-(--brand-blue) text-white"
        style={{ backgroundImage: rings("18% 20%", 64, 0.08) }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-24">
          <div className="flex max-w-md flex-col items-center gap-3 text-center">
            <Eyebrow className="text-(--brand-yellow)">Meet the voices shaping tomorrow</Eyebrow>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-(--brand-yellow)">Speaker</span>{" "}
              <span className="text-(--brand-coral)">lineup</span>
            </h2>
            <p className="leading-7 text-white/90">
              Leading thinkers and practitioners from across the region. The full lineup will be
              announced soon.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {confirmedSpeakers.map((speaker) => (
              <div key={speaker.name} className="flex w-36 flex-col overflow-hidden bg-white sm:w-40">
                <div className="relative aspect-[4/5] bg-slate-200">
                  <Image src={speaker.photo} alt={speaker.name} fill sizes="160px" className="object-cover object-top" />
                </div>
                <div className="flex h-16 flex-col items-center justify-center px-2 text-center">
                  <p className="text-xs font-bold text-(--brand-coral)">{speaker.name}</p>
                  <p className="text-[11px] leading-tight text-(--brand-text)">{speaker.role}</p>
                </div>
              </div>
            ))}
            {mysteryFirstRow.map((color, i) => (
              <MysteryCard key={`first-${i}`} color={color} size="lg" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-8">
            {mysteryGrid.map((color, i) => (
              <MysteryCard key={i} color={color} />
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-(--brand-cream)">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-24">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-ink)">Three lenses. One frontier.</Eyebrow>
            <h2 className="text-4xl font-bold tracking-tight text-(--brand-ink) sm:text-5xl">
              From insight to <em className="font-bold text-(--brand-coral)">impact.</em>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.id}
                className={`flex flex-col gap-4 rounded-tr-[96px] p-7 pb-10 text-(--brand-ink) ${colorClass[pillarColors[i]]}`}
              >
                <span className="text-2xl font-bold">{i + 1}</span>
                <h3 className="text-3xl font-bold leading-tight">{pillar.title}</h3>
                <p className="text-sm leading-6">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two days */}
      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-ink)">Two days of discovery</Eyebrow>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-(--brand-ink) sm:text-5xl">
              Your festival of
              <br />
              <em className="font-bold text-(--brand-coral)">learning.</em>
            </h2>
          </div>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="relative aspect-[377/429] w-full max-w-sm bg-(--brand-night)">
              <Image
                src="/images/design/conference-hall.webp"
                alt="Conference hall with an audience"
                fill
                sizes="(min-width: 768px) 384px, 100vw"
                className="object-cover"
              />
              <span className="absolute -left-3 bottom-6 -rotate-3 bg-(--brand-yellow) px-3 py-1 text-[10px] font-bold uppercase text-(--brand-ink)">
                Program preview
              </span>
            </div>
            <div className="flex flex-col border-t border-(--brand-text)/60">
              {days.map((day) => (
                <Link
                  key={day.label}
                  href="/agenda"
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 border-b border-(--brand-text)/60 py-8 sm:gap-10"
                >
                  <div>
                    <p className="text-xs font-bold uppercase text-(--brand-text)">{day.label}</p>
                    <p className="whitespace-nowrap text-lg font-bold text-(--brand-coral)">{day.date}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-(--brand-ink) sm:text-2xl">{day.title}</p>
                    <p className="mt-1 text-sm leading-6">{day.body}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-(--brand-ink) text-(--brand-ink) transition-colors group-hover:bg-(--brand-blue) group-hover:text-white" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bali */}
      <section className="bg-(--brand-blue) text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-yellow)">Let Bali move you</Eyebrow>
            <h2 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Meet in a place where <span className="text-(--brand-teal)">connection</span> comes
              naturally.
            </h2>
          </div>
          <div className="grid h-[32rem] grid-cols-2 grid-rows-2 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <Photo src="/images/design/bali-1.webp" alt="Lake temple in Bali at sunset" className="row-span-2" />
            <Photo src="/images/design/bali-2.webp" alt="Temple and flowers by a Bali lake" />
            <Photo src="/images/design/bali-4.webp" alt="Bali temple gate at sunset" className="hidden md:block md:row-span-2" />
            <Photo src="/images/design/bali-3.webp" alt="Resort in Bali" />
          </div>
          <div className="flex flex-col gap-6 border-2 border-white/80 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 shrink-0" aria-hidden>
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              <p className="text-lg font-bold leading-tight">
                Conference Venue
                <br />
                {event.location}
              </p>
            </div>
            <p className="max-w-xs text-sm text-white/90">
              Venue details and recommended accommodation will be shared as soon as they are
              confirmed.
            </p>
            <a
              href={venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-bold text-(--brand-ink)"
            >
              View Location
            </a>
          </div>
        </div>
      </section>

      {/* Tickets */}
      <section className="bg-(--brand-yellow)">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-ink)">Your place at the frontier</Eyebrow>
            <h2 className="text-4xl font-bold tracking-tight text-(--brand-ink) sm:text-5xl">
              Choose your <em className="font-bold text-(--brand-coral)">ticket.</em>
            </h2>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.name}
                className={`relative flex flex-col items-center gap-6 border-2 px-6 py-10 text-center ${
                  ticket.featured
                    ? "border-(--brand-blue) bg-(--brand-blue) text-white shadow-[10px_10px_0_var(--brand-coral)] md:py-14"
                    : "border-(--brand-ink) bg-white text-(--brand-ink)"
                }`}
              >
                {ticket.featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-(--brand-teal) px-3 py-1 text-xs font-bold text-(--brand-ink) sm:left-auto sm:right-6 sm:translate-x-0">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{ticket.name}</h3>
                  <p className={`mt-1 text-xs ${ticket.featured ? "text-white/80" : "text-(--brand-text)"}`}>
                    {ticket.audience}
                  </p>
                </div>
                <p className="text-xl font-bold">Price to be announced</p>
                <ul className="flex flex-col gap-3 text-left text-sm">
                  {ticketInclusions.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4 shrink-0 text-(--brand-gold)" aria-hidden>
                        <path d="m4 12 5 5L20 6" />
                      </svg>
                      <span className={ticket.featured ? "text-white/90" : "text-(--brand-text)"}>{item}</span>
                    </li>
                  ))}
                </ul>
                <RegisterLink
                  href="/register"
                  className={`flex h-12 w-full max-w-56 items-center justify-center rounded-full text-sm font-bold ${
                    ticket.featured
                      ? "btn-yellow-on-dark bg-(--brand-yellow) text-(--brand-ink)"
                      : "btn-outline border-2 border-(--brand-ink) text-(--brand-ink)"
                  }`}
                >
                  Register Interest
                </RegisterLink>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-(--brand-ink)">
            Final inclusions and booking terms will be published with confirmed pricing.
          </p>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <Eyebrow className="text-(--brand-ink)">Together at the frontier</Eyebrow>
            <h2 className="text-4xl font-bold tracking-tight text-(--brand-ink) sm:text-5xl">Our partners</h2>
          </div>
          <div className="grid w-full grid-cols-2 border-y border-(--brand-text)/50 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex h-24 items-center justify-center border-r border-(--brand-text)/30 px-3 text-center text-sm text-(--brand-text)/70 last:border-r-0"
              >
                Partner to be announced
              </div>
            ))}
          </div>
          <Link
            href="/sponsors"
            className="link-arrow flex items-center gap-2 border-b-2 border-(--brand-ink) pb-1 text-sm font-bold text-(--brand-ink)"
          >
            Explore partnership opportunities
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-(--brand-cream)">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-(--brand-ink)">Good to know</Eyebrow>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-(--brand-ink) sm:text-5xl">
              Questions,
              <br />
              <em className="font-bold text-(--brand-coral)">answered.</em>
            </h2>
            <p className="mt-6 text-sm">Can’t find what you need?</p>
            <a
              href={helpWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow flex w-fit items-center gap-2 border-b-2 border-(--brand-ink) pb-1 text-sm font-bold text-(--brand-ink)"
            >
              Contact the conference team
              <span aria-hidden>→</span>
            </a>
          </div>
          <div className="flex flex-col border-t border-(--brand-text)/60">
            {faqs.map((faq, i) => (
              <details key={faq.question} open={i === 0} className="group border-b border-(--brand-text)/60 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-(--brand-ink) decoration-(--brand-coral) decoration-2 underline-offset-4 hover:underline">
                  {faq.question}
                  <span className="text-xl transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="relative overflow-hidden bg-(--brand-blue) text-white">
        <Image src="/images/design/cta-audience.webp" alt="" fill sizes="100vw" className="object-cover" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
          <p className="text-lg font-bold uppercase text-(--brand-yellow)">Bali · {event.date}</p>
          <h2 className="text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-6xl">
            {event.name}
            <br />
            starts <em className="font-extrabold text-(--brand-yellow)">with us.</em>
          </h2>
          <p className="max-w-lg leading-7 text-white/90">
            The next frontier is not simply something we wait for. It is something we create
            together.
          </p>
          <RegisterLink
            href="/register"
            className="btn-yellow-on-dark flex h-12 items-center justify-center rounded-full bg-(--brand-yellow) px-10 text-sm font-bold text-(--brand-ink)"
          >
            Register Now
          </RegisterLink>
          <p className="pt-4 text-sm font-bold uppercase tracking-wide text-(--brand-yellow)">
            One Region. One Coaching Community. One Shared Future.
          </p>
        </div>
      </section>
    </div>
  );
}
