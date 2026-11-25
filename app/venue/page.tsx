import type { Metadata } from "next";
import Image from "next/image";
import { event } from "../data/event";
import PageHero from "../components/PageHero";
import RegisterLink from "@/app/components/RegisterLink";

export const metadata: Metadata = {
  title: "Venue & Bali | APAC Coaching Conference 2027",
  description: "Venue, hotel and travel information for APAC Coaching Conference 2027 in Bali.",
};

const stayCards = [
  { title: "Official Hotel", body: "The official conference hotel and booking link are to be announced." },
  { title: "Partner Rates", body: "Partner room rates for participants are to be announced." },
  {
    title: "Airport transfers",
    body: "Recommended transfer options and journey guidance will be added with the venue address.",
  },
  {
    title: "Accessibility",
    body: "Venue access, mobility and dietary information will be published after venue confirmation.",
  },
];

const travelTips = [
  "Check current entry and visa requirements with official Indonesian authorities.",
  "Allow additional journey time when travelling between areas in Bali.",
  "Choose lightweight clothing and bring a layer for air-conditioned conference spaces.",
  "Review travel insurance and health guidance before departure.",
];

export default function VenuePage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow="Destination Bali"
        title="Meet where connection"
        highlight="comes naturally."
      />

      {/* Photo with the destination card overlapping its lower left */}
      <section className="relative">
        <div className="relative flex min-h-[28rem] w-full items-end sm:h-[37.5rem]">
          <Image src="/images/design/venue-hero.webp" alt="Bali temple by the lake" fill sizes="100vw" className="object-cover" />
          <div className="relative mx-auto w-full max-w-6xl px-6 pt-40">
            <div className="flex max-w-2xl flex-col gap-4 bg-(--brand-blue)/80 p-8 text-white backdrop-blur-sm sm:p-12">
              <h2 className="text-3xl font-bold uppercase sm:text-5xl">{event.location}</h2>
              <p className="leading-7 sm:text-lg">
                Experience the power of connection, collaboration and community in Bali, a
                destination renowned for its warmth, culture and inspiration.
              </p>
              <p className="leading-7 sm:text-lg">
                The exact venue address has not yet been announced. Map, transfer and accessibility
                details will be published here once confirmed.
              </p>
              <p className="font-bold text-(--brand-yellow)">{event.date}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
        <div className="flex flex-col gap-3">
          <p className="text-base font-bold uppercase sm:text-xl">Plan your stay</p>
          <h2 className="text-5xl font-bold tracking-[-0.05em] sm:text-7xl lg:text-[88px] lg:leading-none">
            Hotel &amp; <em className="font-bold text-(--brand-coral)">travel.</em>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {stayCards.map((card) => (
            <div key={card.title} className="flex flex-col gap-6 border border-black bg-white px-12 py-14">
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="text-lg leading-7">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 bg-(--brand-blue) px-8 py-12 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:items-center md:px-16">
          <div className="flex flex-col gap-3">
            <p className="text-base font-bold uppercase text-(--brand-yellow) sm:text-xl">Before you travel</p>
            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">Leave space for Bali.</h2>
          </div>
          <ul className="flex flex-col gap-5 text-base leading-7 sm:text-lg">
            {travelTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg sm:text-2xl">
            Hotel details will also be shared with registered participants when confirmed.
          </p>
          <RegisterLink
            href="/register"
            className="flex h-12 w-fit shrink-0 items-center rounded-full bg-(--brand-yellow) px-7 text-sm font-bold uppercase"
          >
            Register now
          </RegisterLink>
        </div>
      </section>
    </div>
  );
}
